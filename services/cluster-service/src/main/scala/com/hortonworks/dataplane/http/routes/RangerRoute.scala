package com.hortonworks.dataplane.http.routes

import java.net.URL
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.commons.domain.Entities.ClusterService
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.hortonworks.dataplane.cs.StorageInterface
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService}
import com.hortonworks.dataplane.http.BaseRoute

import scala.concurrent.Future
import scala.util.{Failure, Success}
import play.api.libs.json.{JsObject, Json}
import com.hortonworks.dataplane.http.JsonSupport._
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global

class RangerRoute @Inject()(
      private val clusterComponentService: ClusterComponentService,
      private val clusterHostsService: ClusterHostsService,
      private val storageInterface: StorageInterface,
      private val ws: WSClient
                           ) extends BaseRoute {
  val rangerAudit =
    path ("cluster" / LongNumber / "ranger" / "audit" / Segment) { (clusterId, assetName) =>
      get {
        onComplete (requestRangerForAudit(clusterId, assetName)) {
          case Success(res) => complete(success(res.json))
          case Failure(th) => complete(StatusCodes.InternalServerError, errors(th))
        }
      }
    }


  private def requestRangerForAudit(clusterId: Long, assetName: String) : Future[WSResponse] = {
    for {
      service <- getConfigOrThrowException(clusterId)
      url <- getRangerUrlFromConfig(service)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      user <- storageInterface.getConfiguration("dp.ranger.user")
      pass <- storageInterface.getConfiguration("dp.ranger.password")
      urlToHit <- Future.successful(s"${baseUrls.head}/service/assets/accessAudit?page=0&pageSize=20&sortBy=eventTime&resourceType=@table&resourcePath=${assetName}")
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
        .withAuth(user.get,pass.get,WSAuthScheme.BASIC)
        .get()
    } yield {
      response
    }
  }

  private def getConfigOrThrowException(clusterId: Long) = {
    clusterComponentService.getServiceByName(clusterId, "RANGER").map {
      case Right(endpoints) => endpoints
      case Left(errors) =>
        throw new Exception(
          s"Could not get the service Url from storage - $errors")
    }
  }

  def getRangerUrlFromConfig(service: ClusterService): Future[URL] = Future.successful {

    val configsAsList = (service.properties.get \ "properties").as[List[JsObject]]
    val rangerConfig = configsAsList.find(obj =>
      (obj \ "type").as[String] == "admin-properties")
    if (rangerConfig.isEmpty)
      throw ServiceNotFound("No properties found for Ranger")
    val properties = (rangerConfig.get \ "properties").as[JsObject]
    val apiUrl = (properties \ "policymgr_external_url").as[String]
    new URL(apiUrl)
  }

  def extractUrlsWithIp(urlObj: URL, clusterId: Long): Future[Seq[String]] = {

    println(urlObj.getHost)
    clusterHostsService.getHostByClusterAndName(clusterId, urlObj.getHost)
      .map {
        case Right(host) => Seq(s"${urlObj.getProtocol}://${host.ipaddr}:${urlObj.getPort}")
        case Left(errors) => throw new Exception(s"Cannot translate the hostname into an IP address $errors")
      }

  }

}
