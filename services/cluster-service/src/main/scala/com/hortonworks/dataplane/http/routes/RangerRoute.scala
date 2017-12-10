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
import javax.inject.Inject

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives._
import com.google.common.annotations.VisibleForTesting
import com.hortonworks.dataplane.commons.domain.Entities.ClusterService
import com.hortonworks.dataplane.commons.domain.{Constants, Entities}
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.hortonworks.dataplane.cs.{
  ClusterDataApi,
  CredentialInterface,
  StorageInterface
}
import com.hortonworks.dataplane.db.Webservice.{
  ClusterComponentService,
  ClusterHostsService,
  DpClusterService,
  ClusterService => CS
}
import com.hortonworks.dataplane.http.BaseRoute
import com.hortonworks.dataplane.http.JsonSupport._
import com.hortonworks.dataplane.knox.Knox.{KnoxApiRequest, KnoxConfig}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class RangerRoute @Inject()(
    private val clusterComponentService: ClusterComponentService,
    private val clusterHostsService: ClusterHostsService,
    private val storageInterface: StorageInterface,
    private val credentialInterface: CredentialInterface,
    private val dpClusterService: DpClusterService,
    private val cs: CS,
    private val clusterDataApi: ClusterDataApi,
    private val config: Config,
    private val ws: WSClient
) extends BaseRoute {

  private val defaultHeaders = "Accept" -> "application/json, text/javascript, */*; q=0.01"

  private val tokenTopologyName =
    Try(config.getString("dp.services.knox.token.topology"))
      .getOrElse("token")

  val rangerAudit =
    path("cluster" / LongNumber / "ranger" / "audit" / Segment / Segment) {
      (clusterId, dbName, tableName) =>
        extractRequest { request =>
          parameters("limit".as[Int],
                     "offset".as[Int],
                     "accessType".as[String],
                     "accessResult".as[String]) {
            (limit, offset, accessType, accessResult) =>
              get {
                onComplete(
                  requestRangerForAudit(request,
                                        clusterId,
                                        dbName,
                                        tableName,
                                        offset,
                                        limit,
                                        accessType,
                                        accessResult)) {
                  case Success(res) => complete(success(res.json))
                  case Failure(th) =>
                    th match {
                      case th: ServiceNotFound =>
                        complete(StatusCodes.NotFound, errors(th))
                      case _ =>
                        complete(StatusCodes.InternalServerError, errors(th))
                    }
                }
              }
          }
        }
    }

  val rangerPolicy =
    path("cluster" / LongNumber / "ranger" / "policies") { clusterId =>
      extractRequest { request =>
        parameters("limit".as[Int],
                   "offset".as[Int],
                   "serviceType".as[String],
                   "dbName".as[String].?,
                   "tableName".as[String].?,
                   "tags".as[String].?) {
          (limit, offset, serviceType, dbName, tableName, tags) =>
            get {
              onComplete(
                requestRangerForPolicies(request,
                                         clusterId,
                                         serviceType,
                                         dbName,
                                         tableName,
                                         tags,
                                         offset,
                                         limit)) {
                case Success(json) => complete(success(json))
                case Failure(th) =>
                  th match {
                    case th: ServiceNotFound =>
                      complete(StatusCodes.NotFound, errors(th))
                    case _ =>
                      complete(StatusCodes.InternalServerError, errors(th))
                  }
              }
            }
        }
      }
    }

  private def requestRangerForPolicies(request: HttpRequest,
                                       clusterId: Long,
                                       serviceType: String,
                                       dbName: Option[String],
                                       tableName: Option[String],
                                       tags: Option[String],
                                       offset: Long,
                                       pageSize: Long): Future[JsValue] = {
    serviceType match {
      case "hive" =>
        requestRangerForResourcePolicies(request,
                                         clusterId,
                                         dbName.get,
                                         tableName.get,
                                         offset,
                                         pageSize)
      case "tag" =>
        requestRangerForTagPolicies(request,
                                    clusterId,
                                    serviceType,
                                    dbName,
                                    tableName,
                                    tags,
                                    offset,
                                    pageSize)
      case _ =>
        throw UnsupportedInputException(
          1001,
          "This is not a supported Ranger service.")
    }
  }

  private def requestRangerForTagPolicies(request: HttpRequest,
                                          clusterId: Long,
                                          serviceType: String,
                                          dbName: Option[String],
                                          tableName: Option[String],
                                          tags: Option[String],
                                          offset: Long,
                                          pageSize: Long): Future[JsObject] = {
    // assuming that no tag can have more than one policy
    val queries = getBuiltQueries(serviceType, tags, offset = 0, pageSize)
    for {
      executor <- getExecutor(request, clusterId)
      token <- getTokenAsOptionalString(request)
      service <- getConfigOrThrowException(clusterId)
      url <- getRangerUrlFromConfig(service)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      credential <- credentialInterface.getCredential("dp.credential.ranger")
      services <- getRangerServicesForType(baseUrls.head,
                                           credential.user,
                                           credential.pass,
                                           serviceType,
                                           executor,
                                           token)
      policies <- Future
        .sequence(
          services.map(
            cServiceId =>
              getRangerPoliciesByServiceIdAndQueries(baseUrls.head,
                                                     credential.user,
                                                     credential.pass,
                                                     cServiceId,
                                                     queries,
                                                     executor,
                                                     token)))
        .map(_.flatten)
    } yield {
      val _policies = policies.slice(offset.toInt, (offset + pageSize).toInt)
      Json.obj(
        "startIndex" -> offset,
        "pageSize" -> pageSize,
        "totalCount" -> policies.size,
        "resultSize" -> _policies.size,
        "policies" -> Json.toJson(_policies)
      )
    }
  }

  private def getBuiltQueries(serviceType: String,
                              tags: Option[String],
                              offset: Long,
                              pageSize: Long): Seq[String] = {
    tags
      .getOrElse("")
      .trim
      .split(",")
      .map(_.trim)
      .filter(cTag => !cTag.isEmpty)
      .sorted
      .map(cTag =>
        s"startIndex=${offset}&pageSize=${pageSize}&resource:tag=${cTag}")
  }

  private def getRangerServicesForType(
      uri: String,
      user: Option[String],
      pass: Option[String],
      serviceType: String,
      knoxApiExecutor: KnoxApiExecutor,
      token: Option[String]): Future[Seq[Long]] = {
    val req = ws
      .url(s"$uri/service/public/v2/api/service?serviceType=$serviceType")
      .withHeaders(defaultHeaders)
      .withAuth(user.get, pass.get, WSAuthScheme.BASIC)

    knoxApiExecutor
      .execute(KnoxApiRequest(req, { r =>
        r.get()
      }, token))
      .map { response =>
        (response.json \\ "id").map { id =>
          id.validate[Long].get
        }
      }
  }

  private def getRangerPoliciesByServiceIdAndQuery(
      uri: String,
      user: Option[String],
      pass: Option[String],
      serviceId: Long,
      query: String,
      knoxApiExecutor: KnoxApiExecutor,
      token: Option[String]): Future[Seq[JsObject]] = {
    val req = ws
      .url(s"$uri/service/plugins/policies/service/$serviceId?$query")
      .withHeaders(defaultHeaders)
      .withAuth(user.get, pass.get, WSAuthScheme.BASIC)

    knoxApiExecutor
      .execute(KnoxApiRequest(req, { r =>
        r.get
      }, token))
      .map { response =>
        (response.json \ "policies").validate[Seq[JsObject]].get
      }
  }

  private def getRangerPoliciesByServiceIdAndQueries(
      uri: String,
      user: Option[String],
      pass: Option[String],
      serviceId: Long,
      queries: Seq[String],
      knoxApiExecutor: KnoxApiExecutor,
      token: Option[String]): Future[Seq[JsObject]] = {
    val futures = queries
      .map(
        cQuery =>
          getRangerPoliciesByServiceIdAndQuery(uri,
                                               user,
                                               pass,
                                               serviceId,
                                               cQuery,
                                               knoxApiExecutor,
                                               token))

    Future.sequence(futures).map(_.flatten)
  }

  private def getExecutor(request: HttpRequest, clusterId: Long) = {
    for {
      cl <- cs.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
      executor <- Future.successful {
        val knoxConfig = KnoxConfig(tokenTopologyName, dpc.knoxUrl)
        if (useToken(request, dpc)) {
          KnoxApiExecutor(knoxConfig, ws)
        } else
          KnoxApiExecutor.withTokenDisabled(knoxConfig, ws)
      }
    } yield executor
  }

  private def useToken(request: HttpRequest, dpc: Entities.DataplaneCluster) = {
    dpc.knoxEnabled.isDefined && dpc.knoxEnabled.get && dpc.knoxUrl.isDefined && request
      .getHeader(Constants.DPTOKEN)
      .isPresent
  }

  private def requestRangerForAudit(
      request: HttpRequest,
      clusterId: Long,
      dbName: String,
      tableName: String,
      offset: Long,
      pageSize: Long,
      accessType: String,
      accessResult: String): Future[WSResponse] = {
    for {
      executor <- getExecutor(request, clusterId)
      service <- getConfigOrThrowException(clusterId)
      url <- getRangerUrlFromConfig(service)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      credential <- credentialInterface.getCredential("dp.credential.ranger")
      urlToHit1 <- Future.successful(
        s"${baseUrls.head}/service/plugins/definitions?pageSource=Audit")
      wsRequest <- Future.successful(ws
        .url(urlToHit1)
        .withHeaders(defaultHeaders)
        .withAuth(credential.user.get, credential.pass.get, WSAuthScheme.BASIC))
      tokenAsString <- getTokenAsOptionalString(request)
      response1 <- executor.execute(KnoxApiRequest(wsRequest, { r =>
        r.get()
      }, tokenAsString))

      repoType <- Future.successful(getRepoTypeFromRangerServiceDef(response1))
      wsRequest2 <- Future.successful(
        ws.url(
            getUrl(dbName,
                   tableName,
                   offset,
                   pageSize,
                   accessType,
                   accessResult,
                   baseUrls,
                   repoType))
          .withHeaders(defaultHeaders)
          .withAuth(credential.user.get,
                    credential.pass.get,
                    WSAuthScheme.BASIC))
      response <- executor.execute(KnoxApiRequest(wsRequest2, { r =>
        r.get()
      }, tokenAsString))
    } yield {
      response
    }
  }

  private def getTokenAsOptionalString(request: HttpRequest) = {
    Future.successful {
      val optionalToken = request.getHeader(Constants.DPTOKEN)
      val tokenAsString =
        if (optionalToken.isPresent) Some(optionalToken.get().value())
        else None
      tokenAsString
    }
  }

  private def getUrl(dbName: String,
                     tableName: String,
                     offset: Long,
                     pageSize: Long,
                     accessType: String,
                     accessResult: String,
                     baseUrls: Seq[String],
                     repoType: Long) = {
    s"${baseUrls.head}/service/assets/accessAudit?startIndex=$offset&pageSize=$pageSize&repoType=$repoType&sortBy=eventTime&resourcePath=$dbName%2F$tableName&accessType=$accessType&accessResult=$accessResult"
  }

  private def getRepoTypeFromRangerServiceDef(fResp: WSResponse): Long = {
    ((fResp.json \ "serviceDefs")
      .as[Seq[JsObject]]
      .filter(serviceDef => (serviceDef \ "name").as[String] == "hive")
      .head \ "id").as[Long]
  }

  private def getConfigOrThrowException(clusterId: Long) = {
    clusterComponentService.getServiceByName(clusterId, "RANGER").map {
      case Right(endpoints) => endpoints
      case Left(errors) =>
        throw new ServiceNotFound(
          s"Could not get the service Url from storage - $errors")
    }
  }

  def getRangerUrlFromConfig(service: ClusterService): Future[URL] =
    Future.successful {
      val configsAsList =
        (service.properties.get \ "properties").as[List[JsObject]]
      val rangerConfig = configsAsList.find(obj =>
        (obj \ "type").as[String] == "admin-properties")
      if (rangerConfig.isEmpty)
        throw ServiceNotFound("No properties found for Ranger")
      val properties = (rangerConfig.get \ "properties").as[JsObject]
      val apiUrl = (properties \ "policymgr_external_url").as[String]
      new URL(apiUrl)
    }

  @VisibleForTesting
  def extractUrlsWithIp(urlObj: URL, clusterId: Long): Future[Seq[String]] = {
    if (Try(config.getBoolean("dp.service.ambari.single.node.cluster"))
          .getOrElse(false)) {
      clusterDataApi.getAmbariUrl(clusterId).map { ambari =>
        Seq(
          s"${urlObj.getProtocol}://${new URL(ambari).getHost}:${urlObj.getPort}")
      }
    } else {
      clusterHostsService
        .getHostByClusterAndName(clusterId, urlObj.getHost)
        .map {
          case Right(host) =>
            Seq(s"${urlObj.getProtocol}://${host.ipaddr}:${urlObj.getPort}")
          case Left(errors) =>
            throw new Exception(
              s"Cannot translate the hostname into an IP address $errors")
        }
    }

  }

  private def requestRangerForResourcePolicies(
      request: HttpRequest,
      clusterId: Long,
      dbName: String,
      tableName: String,
      offset: Long,
      pageSize: Long): Future[JsValue] = {
    for {
      executor <- getExecutor(request, clusterId)
      token <- getTokenAsOptionalString(request)
      service <- getConfigOrThrowException(clusterId)
      url <- getRangerUrlFromConfig(service)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      credential <- credentialInterface.getCredential("dp.credential.ranger")
      wsRequest <- Future.successful(ws
        .url(
          s"${baseUrls.head}/service/plugins/policies/service/1?startIndex=$offset&pageSize=$pageSize&resource:database=$dbName&resource:table=$tableName")
        .withHeaders(defaultHeaders)
        .withAuth(credential.user.get, credential.pass.get, WSAuthScheme.BASIC))
      response <- executor.execute(KnoxApiRequest(wsRequest, { r =>
        r.get()
      }, token))
    } yield response.json
  }

}
