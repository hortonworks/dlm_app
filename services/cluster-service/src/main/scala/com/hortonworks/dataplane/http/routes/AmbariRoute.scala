package com.hortonworks.dataplane.http.routes

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives.{as, entity, path, post, _}
import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.cs.ClusterErrors.ClusterNotFound
import com.hortonworks.dataplane.cs.{AmbariDataplaneClusterInterface, AmbariDataplaneClusterInterfaceImpl, Credentials, StorageInterface}
import com.hortonworks.dataplane.db.Webservice.{ClusterService, DpClusterService}
import com.hortonworks.dataplane.http.BaseRoute
import com.hortonworks.dataplane.knox.Knox.{KnoxApiRequest, KnoxConfig}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest}

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}
import scala.concurrent.ExecutionContext.Implicits.global

class AmbariRoute @Inject()(val ws: WSClient,
                            val storageInterface: StorageInterface,
                            val clusterService: ClusterService,
                            val dpClusterService: DpClusterService,
                            val config: Config)
    extends BaseRoute {

  import com.hortonworks.dataplane.commons.domain.Ambari._
  import com.hortonworks.dataplane.commons.domain.Entities._
  import com.hortonworks.dataplane.http.JsonSupport._

  val logger = Logger(classOf[AmbariRoute])

  private[dataplane] class TempDataplaneCluster(
      ambariDetailRequest: AmbariDetailRequest)
      extends DataplaneCluster(
        id = None,
        name = "",
        dcName = "",
        description = "",
        ambariUrl = ambariDetailRequest.url,
        createdBy = None,
        properties = None,
        location = None,
        knoxEnabled = Some(ambariDetailRequest.knoxDetected),
        knoxUrl = ambariDetailRequest.knoxUrl
      )

  def mapToCluster(json: Option[JsValue],
                   cluster: String): Future[Option[AmbariCluster]] =
    Future.successful(
      json
        .map { j =>
          val secured =
            (j \ "security_type").validate[String].getOrElse("NONE")
          val map = (j \ "desired_service_config_versions")
            .validate[Map[String, JsValue]]
            .getOrElse(Map())
          Some(
            AmbariCluster(security = secured,
                          clusterName = cluster,
                          services = map.keys.toSeq))
        }
        .getOrElse(None))

  private def getDetails(
      clusters: Seq[String],
      dli: AmbariDataplaneClusterInterface)(implicit token: Option[HJwtToken])
    : Future[Seq[Option[AmbariCluster]]] = {
    val futures = clusters.map { c =>
      for {
        json <- dli.getClusterDetails(c)
        ambariCluster <- mapToCluster(json, c)
      } yield ambariCluster
    }
    Future.sequence(futures)
  }

  def getAmbariDetails(ambariDetailRequest: AmbariDetailRequest,
                       request: HttpRequest): Future[Seq[AmbariCluster]] = {

    val header = request.getHeader("X-DP-Token-Info")
    implicit val token =
      if (header.isPresent) Some(HJwtToken(header.get.value)) else None

    val finalList = for {
      dataplaneCluster <- Future.successful(
        new TempDataplaneCluster(ambariDetailRequest))
      creds <- loadCredentials
      dli <- Future.successful(
        AmbariDataplaneClusterInterfaceImpl(dataplaneCluster,
                                            ws,
                                            config,
                                            creds))
      clusters <- dli.discoverClusters
      details <- getDetails(clusters, dli)
    } yield details
    finalList.map { item =>
      item.collect { case o if o.isDefined => o.get }
    }

  }

  private def loadCredentials = {
    val creds = for {
      user <- storageInterface.getConfiguration("dp.ambari.superuser")
      pass <- storageInterface.getConfiguration("dp.ambari.superuser.password")
    } yield {
      Credentials(user, pass)
    }
    creds
  }

  def getClusterData(clusterId: Long) = {
    for {
      c <- clusterService.retrieve(clusterId.toString)
      ci <- Future.successful {
        if (c.isLeft)
          throw new ClusterNotFound()
        else
          c.right.get
      }
      dpc <- dpClusterService.retrieve(ci.dataplaneClusterId.get.toString)
      dpci <- Future.successful {
        if (dpc.isLeft)
          throw new ClusterNotFound()
        else
          dpc.right.get
      }
    } yield (dpci, ci)

  }

  private def getWrappedRequest(
      url: String,
      dataplaneCluster: DataplaneCluster,
      hJwtToken: Option[HJwtToken]): Future[WSRequest] = {
    val baseReq = ws.url(url)
    if (knoxEnabledAndTokenPresent(dataplaneCluster, hJwtToken))
      Future.successful(baseReq)
    else {
      for {
        creds <- loadCredentials
        req <- Future.successful(
          baseReq.withAuth(creds.user.get, creds.pass.get, WSAuthScheme.BASIC))
      } yield req
    }
  }

  private def knoxEnabledAndTokenPresent(dataplaneCluster: DataplaneCluster, hJwtToken: Option[HJwtToken]) = {
    logger.debug("Dump Knox data")
    logger.debug(s"Token - $hJwtToken")
    logger.debug(s" Cluster - Knox enabled:${dataplaneCluster.knoxEnabled}, URL: ${dataplaneCluster.knoxUrl}")
    hJwtToken.isDefined && dataplaneCluster.knoxEnabled.isDefined && dataplaneCluster.knoxEnabled.get && dataplaneCluster.knoxUrl.isDefined
  }

  def callAmbariApi(cluster: Cluster,
                    dataplaneCluster: DataplaneCluster,
                    request: HttpRequest,
                    req: String,
                    clusterCall: Boolean = true) = {
    logger.info("Calling ambari")
    // Prepare Knox
    val tokenInfoHeader = request.getHeader(Constants.DPTOKEN)
    val knoxConfig = KnoxConfig(
      Try(config.getString("dp.services.knox.token.topology"))
        .getOrElse("token"),
      dataplaneCluster.knoxUrl)
    val token =
      if (tokenInfoHeader.isPresent)
        Some(HJwtToken(tokenInfoHeader.get().value()))
      else None

    // Decide on the executor
    val executor =
      if (knoxEnabledAndTokenPresent(dataplaneCluster, token)) {
        logger.info(s"Knox was enabled and a token was detected, Ambari will be called through Knox at ${dataplaneCluster.knoxUrl.get}")
        KnoxApiExecutor(knoxConfig, ws)
      }
      else {
        logger.info(s"No knox detected/No token in context, calling Ambari with credentials")
        KnoxApiExecutor.withTokenDisabled(knoxConfig, ws)
      }

    val rest = if (req.startsWith("/")) req.substring(1) else req

    val wrappedRequest = getWrappedRequest(
      s"${getUrl(cluster, clusterCall)}/$rest",
      dataplaneCluster,
      token)

    val tokenAsString = token
      .map { t =>
        Some(t.token)
      }
      .getOrElse(None)

    val knoxResponse = for {
      wr <- wrappedRequest
      kr <- executor.execute(KnoxApiRequest(wr, { r =>
        r.get()
      }, tokenAsString))
    } yield kr

    knoxResponse.map(_.json)
  }

  private def getUrl(cluster: Cluster, clusterCall: Boolean) = {
    val url = cluster.clusterUrl.get
    if (!clusterCall) {
      url.substring(0, url.indexOf("/clusters/"))
    } else
      url
  }

  private def issueAmbariCall(clusterId: Long,
                              request: HttpRequest,
                              req: String,
                              clusterCall: Boolean = true) = {
    logger.debug(s"Ambari proxy request for $clusterId - $req")

    for {
      cluster <- getClusterData(clusterId)
      response <- callAmbariApi(cluster._2,
                                cluster._1,
                                request,
                                req,
                                clusterCall)
    } yield response
  }

  val ambariClusterProxy = path(LongNumber / "ambari" / "cluster") {
    clusterId =>
      pathEnd {
        extractRequest { request =>
          parameters("request") { req =>
            val ambariResponse = issueAmbariCall(clusterId, request, req)
            onComplete(ambariResponse) {
              case Success(res) =>
                complete(res)
              case Failure(th) =>
                th.getClass match {
                  case c if c == classOf[ClusterNotFound] =>
                    complete(StatusCodes.NotFound, notFound)
                  case _ =>
                    complete(StatusCodes.InternalServerError, errors(th))
                }
            }
          }
        }
      }
  }

  val ambariGenericProxy = path(LongNumber / "ambari") { clusterId =>
    pathEnd {
      extractRequest { request =>
        parameters("request") { req =>
          val ambariResponse = issueAmbariCall(clusterId, request, req, false)
          onComplete(ambariResponse) {
            case Success(res) =>
              complete(res)
            case Failure(th) =>
              th.getClass match {
                case c if c == classOf[ClusterNotFound] =>
                  complete(StatusCodes.NotFound, notFound)
                case _ =>
                  complete(StatusCodes.InternalServerError, errors(th))
              }
          }
        }
      }
    }
  }

  val route = path("ambari" / "details") {
    post {
      extractRequest { request =>
        entity(as[AmbariDetailRequest]) { adr =>
          val list = getAmbariDetails(adr, request)
          onComplete(list) {
            case Success(clusters) =>
              clusters.size match {
                case 0 =>
                  complete(StatusCodes.NotFound, notFound)
                case _ => complete(success(clusters))
              }
            case Failure(th) =>
              complete(StatusCodes.InternalServerError, errors(th))
          }
        }
      }
    }
  }

}
