package com.hortonworks.dataplane.http.routes

import java.net.URL
import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject

import akka.actor.ActorSystem
import akka.http.scaladsl.model.HttpHeader.ParsingResult
import akka.http.scaladsl.model.headers.Cookie
import akka.http.scaladsl.model.{HttpHeader, HttpRequest, Uri}
import akka.http.scaladsl.server.{Route, RouteResult, ValidationRejection}
import akka.http.scaladsl.{Http, HttpsConnectionContext}
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Sink, Source}
import com.google.common.cache.{CacheBuilder, CacheLoader}
import com.google.inject.Provider
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.ClusterDataApi
import com.hortonworks.dataplane.cs.utils.SSLUtils.DPTrustStore
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

/**
  * This route enables other services to talk to other HDP http services
  * like Webhdfs ,WebHcat etc
  *
  * The supported URL scheme is
  *
  * /cluster/:cluster_id/service/:service_name/<path>
  *
  * @param actorSystem
  * @param actorMaterializer
  * @param clusterData
  */
class HdpRoute @Inject()(private val actorSystem: ActorSystem,
                         private val actorMaterializer: ActorMaterializer,
                         private val clusterData: ClusterDataApi,
                         private val sslContext: Provider[HttpsConnectionContext],
                         private val config: Config,dPKeystore: DPTrustStore)
    extends BaseRoute {

  private implicit val system = actorSystem
  private implicit val materializer = actorMaterializer
  private implicit val ec = system.dispatcher

  private lazy val log = Logger(classOf[HdpRoute])

  private lazy val evictOnFailure: String => Unit = { key: String =>
    log.error(s"evicting K -> $key,V -> ${serviceRoutes.get(key)}")
    serviceRoutes.invalidate(key)
  }

  private lazy val serviceRoutes =
    CacheBuilder.newBuilder().build(new KnoxGatewayCacheLoader(clusterData,evictOnFailure))

  private lazy val pathRegex =
    """(\/cluster\/)(\d+)(\/service\/)(\w+)\/(.*)""".r

  private val enabledServices = config.getStringList("dp.services.hdp.proxy.services")

  def valid(request: HttpRequest): Boolean = {
    pathRegex.pattern.matcher(request.uri.path.toString()).matches()
  }

  private lazy val sslConnectionContext = new AtomicReference[HttpsConnectionContext](sslContext.get())

  import com.hortonworks.dataplane.http.JsonSupport._

  val proxy = Route { context =>
    context.request.uri.path match {
      case Uri.Path("/health") =>
        context.complete(success(Json.obj()))
      case _ =>
        val request = context.request
        if (!valid(request)) {
          Future.successful(RouteResult.Rejected(scala.collection.immutable
            .Seq(ValidationRejection(
              """Bad request - Requests must follow (\/cluster\/(\d+)\/service\/)(\w+)"""))))
        } else {

          // extract the token if it exists
          val tokenHeader = context.request.getHeader(Constants.DPTOKEN)
          val jwtToken =
            if (tokenHeader.isPresent)
              Some(HJwtToken(tokenHeader.get().value()))
            else None

          log.info(s"Proxy call contains JWT header - ${jwtToken.isDefined}")

          val matched = pathRegex
            .findAllIn(request.uri.path.toString())
            .matchData
            .toSeq
            .head
          log.info(s"matched URL - ${matched.group(0)}")
          val cluster = matched.group(2)
          log.info(s"cluster $cluster")
          val service = matched.group(4)
          log.info(s"service $service")
          val targetPath = matched.group(5)
          log.info(s"path $targetPath")


          /*
           * Load the knox URL
           * if there was a knox URL configured, then we proceed as follows
           * construct the final service URL by appending
           * the gateway.path and the target topology and the service
           * name.
           * Remove any authorization headers
           * Get a new knox access token
           * Construct a new Cookie header
           * Issue the final call
           *
           * If there was no knox configured
           * this routine does not provide a
           * fallback authentication method, but will
           * try to route the call to the service endpoint
           * passed in with the X-DP-proxy-service-endpoint header
           * and use any authorization header in the request
           *
           */
          for {
            url <- serviceRoutes.get(cluster)

            targetUrl <- Future.successful {
              if (shouldUseKnox(jwtToken, url) && serviceEnabled(service))
                url.get
              else
                new URL(
                  request.getHeader(Constants.SERVICE_ENDPOINT).get.value)
            }

            parsedHeader <- {
              if (shouldUseKnox(jwtToken, url)) {
                //construct a token header
                val accessToken =
                  clusterData.getTokenForCluster(cluster.toLong, jwtToken)
                accessToken.map {
                  case Some(t) =>
                    Seq(HttpHeader.parse("Cookie", s"${Constants.HJWT}=$t"))
                  case None => Seq()
                }
              } else Future.successful(Seq())
            }

            targetHeaders <- Future.successful {
              parsedHeader.flatMap {
                case ParsingResult.Ok(h, e) => Seq(h)
                case _                      => Seq()
              }
            }

            h <- {

              // The filter is needed to clean the dummy auth header added
              // when there was a token and a target knox URL, then remove existing auth urls
              val cleanedHeaders = if (shouldUseKnox(jwtToken, url)) {
                request.headers.filterNot(
                  hi =>
                    hi.lowercaseName() == "authorization" || hi.isInstanceOf[Cookie]
                      || hi.lowercaseName() == Constants.DPTOKEN.toLowerCase) ++ targetHeaders
              } else
                request.headers.filterNot(hi =>
                  hi.isInstanceOf[Cookie]
                    || hi.lowercaseName() == Constants.DPTOKEN.toLowerCase)

              val finalPath = if(shouldUseKnox(jwtToken, url) && serviceEnabled(service)) s"${targetUrl.getPath}/$service/$targetPath" else s"${targetUrl.getPath}/$targetPath"
              val target = HttpRequest(
                method = request.method,
                entity = request.entity,
                headers = cleanedHeaders,
                uri = Uri.from(
                  path = finalPath,
                  queryString = request.uri.queryString(),
                  fragment = request.uri.fragment
                ),
                protocol = request.protocol
              )

              log.info(s"Opening connection to ${targetUrl.getHost}:${targetUrl.getPort}")
              log.info(s"The forwarded request is $target, path $targetPath")



              val flow = if((shouldUseKnox(jwtToken, url) && serviceEnabled(service)) || targetUrl.getProtocol == "https") {
                // set up cert chain
                dPKeystore.storeCertificate(targetUrl) match {
                  case Success(status) =>
                    if (status) {
                      log.info(s"Certificate for ${targetUrl.getHost} was saved")
                      log.info("reloading SSL context")
                      sslConnectionContext.set(sslContext.get())
                    } else {
                      log.info(s"The certificate for ${targetUrl.getHost} is already in the keystore")
                    }
                  case Failure(e) => log.warn(s"The certificate for ${targetUrl.getHost} was not updated",e)
                }

                Http(system)
                  .outgoingConnectionHttps(targetUrl.getHost, targetUrl.getPort, sslConnectionContext.get())
              }
              else Http(system)
                .outgoingConnection(targetUrl.getHost, targetUrl.getPort)
              val handler = Source
                .single(target)
                .via(flow)
                .runWith(Sink.head)
                .flatMap(context.complete(_))
              handler
            }
          } yield h
        }
    }

  }

  private def serviceEnabled(service: String) = {
    enabledServices.contains(service.toLowerCase)
  }

  private def shouldUseKnox(jwtToken: Option[HJwtToken], url: Option[URL]) = {
    url.isDefined && jwtToken.isDefined
  }
}

class KnoxGatewayCacheLoader(private val clusterData: ClusterDataApi,evict:String => Unit)(
    implicit ec: ExecutionContext)
    extends CacheLoader[String, Future[Option[URL]]] {

  private lazy val log = Logger(classOf[KnoxGatewayCacheLoader])

  override def load(key: String): Future[Option[URL]] = {
    val long = key.toLong

    val urlOpt = for {
      knoxEnabled <- clusterData.shouldUseToken(long)
      s <- {
        if (knoxEnabled)
          clusterData.getKnoxUrl(long)
        else Future.successful(None)
      }
      url <- Future.successful {
        s.map { u =>
            Some(new URL(u))
          }
          .getOrElse(None)
      }
    } yield url

    urlOpt.onFailure {
      case e:Throwable =>
        log.error("Cannot load knox URL", e)
        evict(key)
    }

    urlOpt
  }
}
