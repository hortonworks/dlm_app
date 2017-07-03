package com.hortonworks.dataplane.http.routes

import java.net.URL
import java.util.concurrent.{Executors, TimeUnit}

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.HttpHeader.ParsingResult
import akka.http.scaladsl.model.{HttpHeader, HttpRequest, Uri}
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Sink, Source}
import com.google.common.base.{Supplier, Suppliers}
import com.google.common.cache.{Cache, CacheBuilder, CacheLoader}
import com.google.common.io.BaseEncoding
import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => CS}
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.hortonworks.dataplane.cs.StorageInterface
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService, ClusterService, DpClusterService}
import com.hortonworks.dataplane.knox.Knox.{KnoxConfig, TokenResponse}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.joda.time.DateTime
import play.api.libs.json.JsObject
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

class AtlasProxyRoute @Inject()(
    private val actorSystem: ActorSystem,
    private val actorMaterializer: ActorMaterializer,
    private val storageInterface: StorageInterface,
    private val clusterComponentService: ClusterComponentService,
    private val clusterHostsService: ClusterHostsService,
    private val dpClusterService: DpClusterService,
    private val clusterService: ClusterService,
    private val wSClient: WSClient,
    private val config: Config) {

  //Create a new Execution context for use in our proxy
  private implicit val ec = ExecutionContext.fromExecutor(Executors.newWorkStealingPool())

  // The time for which the cluster-supplier mapping should be help in memory
  private val cacheExpiry =
    Try(config.getInt("dp.services.cluster.atlas.proxy.cache.expiry.secs"))
      .getOrElse(600)

  private val tokenCacheExpiry =
    Try(config.getInt("dp.services.cluster.knox.token.cache.expiry.secs"))
      .getOrElse(3600)

  private val tokenExpiryTime =
    Try(config.getInt("dp.services.cluster.knox.token.cache.removal.time"))
      .getOrElse(3)

  private lazy val log = Logger(classOf[AtlasProxyRoute])

  // The time for which the URL should be cached
  private lazy val urlCacheTime =
    Try(config.getInt("dp.services.cluster.http.atlas.endpoint.cache.secs"))
      .getOrElse(600)

  private lazy val localUser: Future[Option[String]] =
    storageInterface.getConfiguration("dp.atlas.user")
  private lazy val localPass: Future[Option[String]] =
    storageInterface.getConfiguration("dp.atlas.password")

  log.info(s"Constructing a cache with expiry $cacheExpiry secs")

  private val clusterAtlasSupplierCache = CacheBuilder
    .newBuilder()
    .expireAfterAccess(cacheExpiry, TimeUnit.SECONDS)
    .build(
      new URLSupplierCacheLoader(clusterComponentService,
                                 clusterHostsService,
                                 urlCacheTime))

  private val tokenCache: Cache[String, TokenResponse] = CacheBuilder
    .newBuilder()
    .expireAfterWrite(tokenCacheExpiry, TimeUnit.SECONDS)
    .build()
    .asInstanceOf[Cache[String, TokenResponse]]

  implicit val materializer = actorMaterializer

  private lazy val urlPattern =
    """(\/atlas\/proxy\/cluster\/)(\d+)(\/token\/)(\w+)(\/url\/)(.*)""".r

  def validToken(tr: TokenResponse): Boolean = {
    val expiry = new DateTime(tr.expires)
      .minusSeconds(tokenExpiryTime)
      .toInstant
      .getMillis
    new DateTime().toInstant.getMillis <= expiry
  }

  val proxy = Route { context =>
    val request = context.request
    log.info(s"Atlas proxy call -> ${request.toString}")
    val pathAsString = request.uri.path.toString
    val matched = urlPattern.findAllIn(pathAsString).matchData.toSeq.head

    // Get the cluster context
    log.info(s"Matched URL -> $matched")
    val clusterId = matched.group(2)
    val atlasPath = s"/${matched.group(6)}"
    val token = matched.group(4)
    // Decode token
    val decodedToken = new String(BaseEncoding.base64Url().decode(token))
    log.info(
      s"Proxy call requested for clusterId -> $clusterId, token -> $decodedToken, atlasPath -> $atlasPath")
    // Load atlas urls
    log.info(s"Looking up cache for the atlas url for cluster $clusterId")
    val supplier = clusterAtlasSupplierCache.get(clusterId)

    for {
      cl <- clusterService.retrieve(clusterId)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
      // should be cached
      url <- supplier.get()
      executor <- Future.successful {
        KnoxApiExecutor(
          KnoxConfig(Try(config.getString("dp.services.knox.token.topology"))
                       .getOrElse("token"),
                     dpc.knoxUrl),
          wSClient)
      }
      // Callback when knox is detected
      newToken <- Future.successful({ () =>
        executor.getKnoxApiToken(s"${Constants.HJWT}=$decodedToken")
      })

      // The auth header - Either a token or a cookie
      parsedHeader <- {
        if (decodedToken != "NONE" && dpc.knoxEnabled.isDefined && dpc.knoxEnabled.get && dpc.knoxUrl.isDefined) {
          // Build cookie header
          log.info("Building cookie for Knox call")
          val accessToken = tokenCache.getIfPresent(decodedToken)
          val optionalToken = Option(accessToken)
          if (optionalToken.isDefined && validToken(optionalToken.get)) {
            log.info("Token in cache and not expired, reusing...")
            Future.successful {
              HttpHeader.parse(
                "Cookie",
                s"${Constants.HJWT}=${optionalToken.get.accessToken}")
            }
          } else {
            // token not in cache or expired
            // remove token from cache
            tokenCache.invalidate(decodedToken)
            newToken().map { t =>
              // add new token to cache
              log.info("No token in cache, Loaded from knox and added to cache")
              tokenCache.put(decodedToken, t)
              HttpHeader.parse("Cookie", s"${Constants.HJWT}=${t.accessToken}")
            }
          }
        } else {
          // build auth header
          log.info("Adding auth for non knox call")
          for {
            lu <- localUser
            lp <- localPass
            toEncode <- Future.successful { s"${lu.get}:${lp.get}" }
            pHeader <- Future.successful {
              log.info(s"Local credentials are $lu:$lp")
              HttpHeader.parse(
                "Authorization",
                s"Basic ${BaseEncoding.base64().encode(toEncode.getBytes)}")
            }
          } yield pHeader
        }
      }

      header <- Future.successful {
        parsedHeader match {
          case ParsingResult.Ok(h, e) => Seq(h)
          case _                      => Seq()
        }
      }


      h <- {
        val target = HttpRequest(
          request.method,
          entity = request.entity,
          // The filter is needed to clean the dummy auth header added
          headers = request.headers.filterNot(
            _.lowercaseName() == "authorization") ++ header,
          uri = Uri.from(scheme = url.getProtocol,
                         host = url.getHost,
                         port = url.getPort,
                         path = atlasPath,
                         queryString = request.uri.queryString(),
                         fragment = request.uri.fragment),
          protocol = request.protocol
        )
        log.info(s"Opening connection to ${url.getHost}:${url.getPort}")
        log.info(s"The forwarded request is $target, path $atlasPath")
        val flow = Http(actorSystem)
          .outgoingConnection(url.getHost, url.getPort)
        val handler = Source
          .single(target)
          .via(flow)
          .runWith(Sink.head)
          .flatMap { o =>
            context.complete(o)
          }
        handler

      }

    } yield h

  }

}

private sealed class AtlasURLSupplier(
    clusterId: Long,
    clusterComponentService: ClusterComponentService,
    clusterHostsService: ClusterHostsService)(implicit ec:ExecutionContext)
    extends Supplier[Future[URL]] {

  private lazy val log = Logger(classOf[AtlasURLSupplier])

  def getAtlasUrlFromConfig(service: CS): Future[URL] = Future.successful {

    val configsAsList =
      (service.properties.get \ "properties").as[List[JsObject]]
    val atlasConfig = configsAsList.find(obj =>
      (obj \ "type").as[String] == "application-properties")
    if (atlasConfig.isEmpty)
      throw ServiceNotFound("No properties found for Atlas")
    val properties = (atlasConfig.get \ "properties").as[JsObject]
    val apiUrl = (properties \ "atlas.rest.address").as[String]
    new URL(apiUrl)
  }

  override def get(): Future[URL] = {

    log.info("Fetching the Atlas URL from storage")
    for {
      service <- getUrlOrThrowException(clusterId)
      url <- getAtlasUrlFromConfig(service)
      atlasUrl <- extractUrl(url, clusterId)
    } yield {
      atlasUrl
    }
  }

  private def getUrlOrThrowException(clusterId: Long) = {
    clusterComponentService
      .getServiceByName(clusterId, Constants.ATLAS)
      .map {
        case Right(endpoints) => endpoints
        case Left(errors) =>
          throw new Exception(
            s"Could not get the service Url from storage - $errors")
      }
  }

  def extractUrl(service: URL, clusterId: Long): Future[URL] = {

    clusterHostsService
      .getHostByClusterAndName(clusterId, service.getHost)
      .map {
        case Right(host) =>
          new URL(
            s"${service.getProtocol}://${host.ipaddr}:${service.getPort}")
        case Left(errors) =>
          throw new Exception(
            s"Cannot translate the hostname into an IP address $errors")
      }
  }

}

sealed class URLSupplierCacheLoader(
    private val clusterComponentService: ClusterComponentService,
    private val clusterHostsService: ClusterHostsService,
    expiry: Int)(implicit ec:ExecutionContext)
    extends CacheLoader[String, Supplier[Future[URL]]]() {

  private lazy val log = Logger(classOf[URLSupplierCacheLoader])

  override def load(key: String): Supplier[Future[URL]] = {
    log.info(
      s"Loading a URL supplier into cache, URL's for cluster-id:$key will be reloaded $expiry seconds after access")
    Suppliers.memoizeWithExpiration(
      new AtlasURLSupplier(key.toLong,
                           clusterComponentService,
                           clusterHostsService),
      expiry,
      TimeUnit.SECONDS)
  }
}
