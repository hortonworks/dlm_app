package com.hortonworks.dataplane.http.routes

import java.net.URL
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.commons.domain.Ambari.{ClusterServiceWithConfigs, ConfigType}
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


class DpProfilerRoute @Inject()(
                             private val clusterComponentService: ClusterComponentService,
                             private val clusterHostsService: ClusterHostsService,
                             private val storageInterface: StorageInterface,
                             private val ws: WSClient
                           ) extends BaseRoute {

  val startJob =
    path ("cluster" / LongNumber / "dp-profiler" / "start-job" / Segment / Segment) { (clusterId, dbName, tableName) =>
      get {
        onComplete(postJob(clusterId, dbName, tableName)) {
          case Success(res) => res.status match {
            case 200 => complete(success(res.json))
            case 404 => complete(StatusCodes.NotFound, notFound)
          }
          case Failure(th) => th match {
            case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(th))
            case _ => complete(StatusCodes.InternalServerError, errors(th))
          }
        }
      }
    }

  val jobStatus =
    path ("cluster" / LongNumber / "dp-profiler" / "job-status" / Segment / Segment) { (clusterId, dbName, tableName) =>
      get {
        onComplete(getJobStatus(clusterId, dbName, tableName)) {
          case Success(res) => res.status match {
            case 200 => complete(success(res.json))
            case 404 => complete(StatusCodes.NotFound, notFound)
          }
          case Failure(th) => th match {
            case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(th))
            case _ => complete(StatusCodes.InternalServerError, errors(th))
          }
        }
      }
    }

  private def getJobStatus(clusterId: Long, dbName: String, tableName: String): Future[WSResponse] = {

    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/jobs/assetjob?assetId=$dbName.$tableName&profilerName=hivecolumn")
      tmp <- Future.successful(println(urlToHit))
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
        .get()
    } yield {
      response
    }
  }

  private def postJob(clusterId: Long, dbName: String, tableName: String): Future[WSResponse] = {
    val postData = Json.obj(
      "profilerName" -> "hivecolumn", //"hivecolumnlive4",
      "conf" -> Json.obj(),
      "assets" -> Seq(
        Json.obj(
          "id" -> s"$dbName.$tableName",
          "assetType"  ->  "Hive",
          "data" -> Json.obj(
            "db" -> dbName,
            "table" -> tableName
          )
        )
      )
    )
    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/jobs")
      tmp <- Future.successful(println(urlToHit))
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
        .post(postData)
    } yield {
      response
    }
  }

  private def getConfigOrThrowException(clusterId: Long) = {
    clusterComponentService.getEndpointsForCluster(clusterId, "DPPROFILER").map {
      case Right(endpoints) => endpoints
      case Left(errors) =>
        throw new ServiceNotFound(
          s"Could not get the service Url from storage - $errors")
    }
  }

  def getUrlFromConfig(service: ClusterServiceWithConfigs): Future[URL] = Future.successful {
    val host = service.servicehost
    val configsAsList = service.configProperties.get.properties
    val profilerConfig = configsAsList.find(obj =>
      obj.`type` == "dpprofiler-env")
    if (profilerConfig.isEmpty)
      throw ServiceNotFound("No properties found for DpProfiler")
    val properties = profilerConfig.get.properties
    val port = properties.get("dpprofiler.http.port").get
    new URL(s"http://$host:$port")
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