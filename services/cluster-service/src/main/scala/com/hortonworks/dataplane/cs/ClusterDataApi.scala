package com.hortonworks.dataplane.cs

import java.net.URL
import java.util.concurrent.{Executors, TimeUnit}

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.google.common.base.{Supplier, Suppliers}
import com.google.common.cache.{Cache, CacheBuilder, CacheLoader, LoadingCache}
import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.{Constants, Entities}
import com.hortonworks.dataplane.commons.domain.Entities.{HJwtToken, ClusterService => CS}
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService, ClusterService, DpClusterService}
import com.hortonworks.dataplane.knox.Knox.{KnoxConfig, TokenResponse}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.joda.time.DateTime
import play.api.libs.json.{JsArray, JsObject, JsValue}
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try


class ClusterDataApi @Inject()(
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
  private implicit val ec =
    ExecutionContext.fromExecutor(Executors.newWorkStealingPool())

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

  private lazy val log = Logger(classOf[ClusterDataApi])

  // The time for which the URL should be cached
  private lazy val urlCacheTime =
    Try(config.getInt("dp.services.cluster.http.atlas.endpoint.cache.secs"))
      .getOrElse(600)

  private lazy val localUser: Future[Option[String]] =
    storageInterface.getConfiguration("dp.atlas.user")
  private lazy val localPass: Future[Option[String]] =
    storageInterface.getConfiguration("dp.atlas.password")

  log.info(s"Constructing a cache with expiry $cacheExpiry secs")

  // Do not remove the cast or the compiler will throw up
  private val clusterAtlasSupplierCache = CacheBuilder
    .newBuilder()
    .expireAfterAccess(cacheExpiry, TimeUnit.SECONDS)
    .build(
      new URLSupplierCacheLoader(clusterComponentService,
                                 clusterHostsService,
                                 urlCacheTime)).asInstanceOf[LoadingCache[Long,Supplier[Future[URL]]]]

  private val tokenCache: Cache[String, TokenResponse] = CacheBuilder
    .newBuilder()
    .expireAfterWrite(tokenCacheExpiry, TimeUnit.SECONDS)
    .build()
    .asInstanceOf[Cache[String, TokenResponse]]

  implicit val materializer = actorMaterializer

  def validToken(tr: TokenResponse): Boolean = {
    val expiry = new DateTime(tr.expires)
      .minusSeconds(tokenExpiryTime)
      .toInstant
      .getMillis
    new DateTime().toInstant.getMillis <= expiry
  }

  def getCredentials: Future[Credentials] = {
    for {
      lu <- localUser
      lp <- localPass
    } yield Credentials(lu, lp)
  }

  def shouldUseToken(clusterId:Long):Future[Boolean] =  {

    for{
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
    } yield dpc.knoxEnabled.isDefined && dpc.knoxEnabled.get && dpc.knoxUrl.isDefined

  }


  def getTokenForCluster(
      clusterId: Long,
      inputToken: Option[HJwtToken]): Future[Option[String]] = {

    for {
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)

      newToken <- Future.successful({ t: String =>
       val executor =  KnoxApiExecutor(
          KnoxConfig(Try(config.getString("dp.services.knox.token.topology"))
            .getOrElse("token"),
            dpc.knoxUrl),
          wSClient)

        executor.getKnoxApiToken(s"${Constants.HJWT}=$t")
      })

      token <- {
        if (inputToken.isDefined && dpc.knoxEnabled.isDefined && dpc.knoxEnabled.get && dpc.knoxUrl.isDefined) {
          val decodedToken = inputToken.get.token
          // Build cookie header
          log.info("Building cookie for Knox call")
          val accessToken = tokenCache.getIfPresent(decodedToken)
          val optionalToken = Option(accessToken)
          if (optionalToken.isDefined && validToken(optionalToken.get)) {
            log.info("Token in cache and not expired, reusing...")
            Future.successful(Some(optionalToken.get.accessToken))
          } else {
            // token not in cache or expired
            // remove token from cache
            tokenCache.invalidate(decodedToken)
            newToken(decodedToken).map { t =>
              // add new token to cache
              log.info(
                "No token in cache, Loaded from knox and added to cache")
              tokenCache.put(decodedToken, t)
              Some(t.accessToken)
            }
          }
        } else {
          Future.successful(None)
        }
      }
    } yield token
  }

  def getAtlasUrl(clusterId:Long) = {
     clusterAtlasSupplierCache.get(clusterId).get()
  }


  private def getKnoxUrl(dpc: Entities.DataplaneCluster, cs: CS) = {
    val topology = config.getString("dp.services.knox.token.target.topology")
    cs.properties match {
      case Some(json) =>
        val item = (json \ "items").as[JsArray].head
        val target = (item \ "configurations").as[List[JsValue]].find(v => (v \ "type").as[String] == "gateway-site")
        val gatewayPath = (target.get \ "properties" \ "gateway.path").as[String]
        Some(s"${dpc.knoxUrl.get.stripSuffix("/")}/$gatewayPath/$topology")
      case None => None
    }
  }

  def getKnoxUrl(clusterId:Long):Future[Option[String]] = {
    for{
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
      service <- clusterComponentService.getServiceByName(clusterId,Constants.KNOX)
      cs <- Future.successful(service.right.get)
    } yield getKnoxUrl(dpc,cs)
  }



}




private sealed class AtlasURLSupplier(
    clusterId: Long,
    clusterComponentService: ClusterComponentService,
    clusterHostsService: ClusterHostsService)(implicit ec: ExecutionContext)
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
    val f = for {
      service <- getUrlOrThrowException(clusterId)
      url <- getAtlasUrlFromConfig(service)
      atlasUrl <- extractUrl(url, clusterId)
    } yield atlasUrl

    // Its important to complete this future before caching it
    for {
      intF <- f
      url <- Future.successful(intF)
    } yield url
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
    expiry: Int)(implicit ec: ExecutionContext)
    extends CacheLoader[Long, Supplier[Future[URL]]]() {

  private lazy val log = Logger(classOf[URLSupplierCacheLoader])

  override def load(key: Long): Supplier[Future[URL]] = {
    log.info(
      s"Loading a URL supplier into cache, URL's for cluster-id:$key will be reloaded $expiry seconds after access")
    Suppliers.memoizeWithExpiration(
      new AtlasURLSupplier(key,
                           clusterComponentService,
                           clusterHostsService),
      expiry,
      TimeUnit.SECONDS)
  }
}
