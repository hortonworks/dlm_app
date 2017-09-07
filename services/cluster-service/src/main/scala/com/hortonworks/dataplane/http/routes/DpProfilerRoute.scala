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
import java.time.Instant
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

  val startAndScheduleJob =
    path("cluster" / LongNumber / "dp-profiler" / "start-schedule-job") { clusterId =>
      extractRequest { request =>
        post {
          entity(as[JsObject]) { js =>
            var list = (js \ "list").as[Seq[String]]
            var trackId = (js \ "jobTrackId").as[String]
            onComplete(postAndScheduleJob(clusterId, trackId, list)) {
              case Success(res) => res.status match {
                case 200 => complete(success(res.json))
                case 404 => complete(StatusCodes.NotFound, notFound)
                case _ => complete(res.status)
              }
              case Failure(th) => th match {
                case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(th))
                case _ => complete(StatusCodes.InternalServerError, errors(th))
              }
            }
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

  val jobDelete =
    path ("cluster" / LongNumber / "dp-profiler" / "profilers") { clusterId: Long =>
      delete {
        parameters('datasetId.as[Long]) { datasetId =>
          onComplete(deleteProfilerByDatasetId(clusterId, datasetId)) {
            case Success(res) => res.status match {
              case 200 => complete(success(res.json))
              case 404 => complete(StatusCodes.NotFound, notFound)
              case _ => complete(StatusCodes.InternalServerError, badRequest)
            }
            case Failure(th) => th match {
              case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(th))
              case _ => complete(StatusCodes.InternalServerError, errors(th))
            }
          }
        }
      }
    }

    private def deleteProfilerByDatasetId(clusterId: Long, datasetId: Long): Future[WSResponse] = {

      for {
        config <- getConfigOrThrowException(clusterId)
        url <- getUrlFromConfig(config)
        baseUrls <- extractUrlsWithIp(url, clusterId)
        urlToHit <- Future.successful(s"${baseUrls.head}/schedules/$datasetId")
        response <- ws.url(urlToHit)
          .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
          .delete()
      } yield {
        response
      }
    }

    private def getJobStatus(clusterId: Long, dbName: String, tableName: String): Future[WSResponse] = {

      for {
        config <- getConfigOrThrowException(clusterId)
        url <- getUrlFromConfig(config)
        baseUrls <- extractUrlsWithIp(url, clusterId)
        urlToHit <- Future.successful(s"${baseUrls.head}/jobs/assetjob?assetId=$dbName.$tableName&profilerName=hivecolumn")
        response <- ws.url(urlToHit)
          .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
          .get()
      } yield {
        response
      }
    }

  private def postAndScheduleJob(clusterId: Long, trackId: String, list: Seq[String]): Future[WSResponse] = {
    val postData = Json.obj(
      "profilerName" -> "hivecolumn", //"hivecolumnlive4",
      "conf" -> Json.obj(),
      "assets" -> list.map{ itm =>{
        var itmAr = itm.split('.')
        Json.obj(
          "id" -> itm,
          "assetType"  ->  "Hive",
          "data" -> Json.obj(
            "db" -> itmAr.head,
            "table" -> itmAr.last
          )
        )
      }}
    )
    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/schedules")
      tmp <- Future.successful(println(urlToHit))
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
        .post(Json.obj("name" -> trackId, "cronExpr" -> s"0 ${(2+(Instant.now.getEpochSecond/60)%60)%60} * * * ?", "jobTask"->postData))
      // Add 2 to current the minute(UTC) to make sure profiling starts within 2 minutes from now.
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