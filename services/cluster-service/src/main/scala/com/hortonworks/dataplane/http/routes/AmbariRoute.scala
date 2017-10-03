/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.http.routes

import java.net.URL

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives.{as, entity, path, post, _}
import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.ClusterErrors.ClusterNotFound
import com.hortonworks.dataplane.cs._
import com.hortonworks.dataplane.db.Webservice.{ClusterService, DpClusterService}
import com.hortonworks.dataplane.http.BaseRoute
import com.hortonworks.dataplane.knox.Knox.{KnoxApiRequest, KnoxConfig}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class AmbariRoute @Inject()(val ws: WSClient,
                            val storageInterface: StorageInterface,
                            val clusterService: ClusterService,
                            val credentialInterface: CredentialInterface,
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
        ambariIpAddress = "",
        createdBy = None,
        properties = None,
        location = None,
        knoxEnabled = Some(ambariDetailRequest.knoxDetected),
        knoxUrl = ambariDetailRequest.knoxUrl
      )

  def mapToCluster(json: Option[JsValue],
                   cluster: String,dataplaneCluster: DataplaneCluster): Future[Option[AmbariCluster]] =
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
                          services = map.keys.toSeq, knoxUrl = dataplaneCluster.knoxUrl))
        }
        .getOrElse(None))

  private def getDetails(dataplaneCluster: DataplaneCluster,clusters: Seq[String],
      dli: AmbariDataplaneClusterInterface)(implicit token: Option[HJwtToken])
    : Future[Seq[Option[AmbariCluster]]] = {
    val futures = clusters.map { c =>
      for {
        json <- dli.getClusterDetails(c)
        ambariCluster <- mapToCluster(json, c,dataplaneCluster)
      } yield ambariCluster
    }
    Future.sequence(futures)
  }

  def getAmbariDetails(ambariDetailRequest: AmbariDetailRequest,
                       request: HttpRequest): Future[Seq[AmbariCluster]] = {

    /*
    Check if Ambari credentials were sent with the request
    and if the configuration expects a separate config group
    for knox

    If true, then update the knox URL to the one pointed to by the
    config group
     */

    val expectConfigGroup =
      config.getBoolean("dp.services.knox.token.expect.separate.config")
    val checkCredentials =
      config.getBoolean("dp.services.knox.token.infer.endpoint.using.credentials")

    // validations
    if (ambariDetailRequest.knoxDetected && expectConfigGroup) {
      if (checkCredentials)
        assert(
          ambariDetailRequest.hasCredentials,
          "Knox detected and a config group was expected, but no credentials sent in request")
      else
        assert(
          ambariDetailRequest.hasTopology,
          "Knox detected and a config group was expected, but no topology sent in request")
    }

    val header = request.getHeader(Constants.DPTOKEN)
    implicit val token =
      if (header.isPresent) Some(HJwtToken(header.get.value)) else None

    val finalList = for {
      dataplaneCluster <- getDpCluster(ambariDetailRequest,expectConfigGroup,checkCredentials)
      creds <- credentialInterface.getCredential("dp.credential.ambari")
      dli <- Future.successful(
        AmbariDataplaneClusterInterfaceImpl(dataplaneCluster,
                                            ws,
                                            config,
                                            creds))
      clusters <- dli.discoverClusters
      details <- getDetails(dataplaneCluster,clusters, dli)
    } yield details

    finalList.map { item =>
      item.collect { case o if o.isDefined => o.get }
    }

  }

  private def loadDefaultCluster(ambariDetailRequest: AmbariDetailRequest) = {
    val clusters = ws.url(s"${ambariDetailRequest.url}/api/v1/clusters")
        .withAuth(ambariDetailRequest.ambariUser.get,ambariDetailRequest.ambariPass.get,WSAuthScheme.BASIC).get()
    clusters.map { cl =>
      val firstCluster = (cl.json \ "items").as[Seq[JsValue]].head
      (firstCluster \ "Clusters" \ "cluster_name").as[String]
    }
  }

  private def rewriteKnoxUrlFromConfigGroup(clusterName: String, ambariDetailRequest: AmbariDetailRequest, groups: WSResponse) = {
    val items =  (groups.json \ "items").as[Seq[JsValue]]
    val groupIds = items.map(i =>(i \ "ConfigGroup" \ "id").as[Int])
    val groupNames = groupIds.map { gid =>
      ws.url(s"${ambariDetailRequest.url}/api/v1/clusters/$clusterName/config_groups/$gid")
        .withAuth(ambariDetailRequest.ambariUser.get,ambariDetailRequest.ambariPass.get,WSAuthScheme.BASIC).get().map { r =>
        val name = (r.json \ "ConfigGroup" \ "group_name").as[String]
        val hostName = ((r.json \ "ConfigGroup" \ "hosts").as[Seq[JsValue]].head \ "host_name").as[String]
        (name,hostName)
      }
    }

    val name = config.getString("dp.services.knox.token.config.group.name")
    val tokenHost = Future.sequence(groupNames).map { gn =>
      gn.find(_._1 == name)
    }.map { v =>
      assert(v.isDefined,s"Could not locate any config group with the name $name")
      v.get._2
    }

    //Create a new token URL using this host
    val jwtProviderUrl = new URL(ambariDetailRequest.knoxUrl.get)
    tokenHost.map(th => s"${jwtProviderUrl.getProtocol}://$th:" +jwtProviderUrl.getPort)
  }

  private def loadKnoxUrl(clusterName: String, ambariDetailRequest: AmbariDetailRequest) = {
    // get all config group ids
    val configGroups =  ws.url(s"${ambariDetailRequest.url}/api/v1/clusters/$clusterName/config_groups")
      .withAuth(ambariDetailRequest.ambariUser.get,ambariDetailRequest.ambariPass.get,WSAuthScheme.BASIC).get()
    for {
      groups <- configGroups
      knoxUrl <- rewriteKnoxUrlFromConfigGroup(clusterName,ambariDetailRequest,groups)
    } yield knoxUrl

  }

  private def getTargetUrl(ambariDetailRequest: AmbariDetailRequest) = {
    for {
      clusterName <- loadDefaultCluster(ambariDetailRequest)
      newUrl <- loadKnoxUrl(clusterName,ambariDetailRequest)
    } yield newUrl
  }

  private def getDpCluster(ambariDetailRequest: AmbariDetailRequest, expectConfigGroup:Boolean, checkCredentials:Boolean) = {
    // set the Knox Url with the entered URL if set up
    val newRequest = if(ambariDetailRequest.knoxDetected && expectConfigGroup ){
      if(!checkCredentials)
        Future.successful(ambariDetailRequest.copy(knoxUrl = Some(ambariDetailRequest.knoxTopology.get)))
      else{
        getTargetUrl(ambariDetailRequest).map(url => ambariDetailRequest.copy(knoxUrl = Some(url)))
      }
    } else Future.successful(ambariDetailRequest)

    newRequest.map(new TempDataplaneCluster(_))
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
        creds <- credentialInterface.getCredential("dp.credential.ambari")
        req <- Future.successful(
          baseReq.withAuth(creds.user.get, creds.pass.get, WSAuthScheme.BASIC))
      } yield req
    }
  }

  private def knoxEnabledAndTokenPresent(dataplaneCluster: DataplaneCluster,
                                         hJwtToken: Option[HJwtToken]) = {
    logger.debug("Dump Knox data")
    logger.debug(s"Token - $hJwtToken")
    logger.debug(
      s" Cluster - Knox enabled:${dataplaneCluster.knoxEnabled}, URL: ${dataplaneCluster.knoxUrl}")
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
        logger.info(
          s"Knox was enabled and a token was detected, Ambari will be called through Knox at ${dataplaneCluster.knoxUrl.get}")
        KnoxApiExecutor(knoxConfig, ws)
      } else {
        logger.info(
          s"No knox detected/No token in context, calling Ambari with credentials")
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

  def mapToServiceInfo(json: Option[JsValue],
                       srvcName: String): Future[Option[ServiceInfo]] =
    Future.successful(
      json
        .map { j =>
          val st =
            (j \ "state").validate[String].getOrElse("NONE")
          Some(
            ServiceInfo(serviceName = srvcName , state = st))
        }
        .getOrElse(None))

  def getServiceInfoSeq(services: Seq[String],dli: AmbariDataplaneClusterInterface, dataplaneCluster: DataplaneCluster)(implicit token: Option[HJwtToken]): Future[Seq[Option[ServiceInfo]]] = {
    val list = services.map { srvc =>
      for{
        json <- dli.getServiceInfo(dataplaneCluster.name,srvc)
        serviceInfo <- {
          mapToServiceInfo(json, srvc)
        }
      } yield  serviceInfo
    }
    Future.sequence(list)
  }

  def getAmbariServicesInfo(dataplaneCluster: DataplaneCluster,
                            request: HttpRequest): Future[Seq[ServiceInfo]] = {

    val header = request.getHeader(Constants.DPTOKEN)
    implicit val token =
      if (header.isPresent) Some(HJwtToken(header.get.value)) else None
    val list = for {
      creds <- credentialInterface.getCredential("dp.credential.ambari")
      dli <- Future.successful(
        AmbariDataplaneClusterInterfaceImpl(dataplaneCluster,
          ws,
          config,
          creds))
      services <- dli.getServices(dataplaneCluster.name)
      serviceInfoSeq <- getServiceInfoSeq(services,dli,dataplaneCluster)
    } yield  serviceInfoSeq

    list.map { item =>
      item.collect { case o if o.isDefined => o.get }
    }
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

  val ServiceStateRoute = path("ambari" / "servicesInfo") {
    post {
      extractRequest { request =>
        entity(as[DataplaneCluster]) { dpc =>
          val list = getAmbariServicesInfo(dpc, request)
          onComplete(list) {
            case Success(serviceInfoes) =>
              serviceInfoes.size match {
                case 0 =>
                  complete(StatusCodes.NotFound, notFound)
                case _ => {
                  complete(success(serviceInfoes))

                }
              }
            case Failure(th) =>
              complete(StatusCodes.InternalServerError, errors(th))
          }
        }
      }
    }
  }


}
