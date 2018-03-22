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
import com.hortonworks.dataplane.cs.{ClusterDataApi, StorageInterface}
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService}
import com.hortonworks.dataplane.http.BaseRoute

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}
import play.api.libs.json.{JsObject, Json}
import play.api.libs.json.JsSuccess
import play.api.libs.json.JsError
import com.hortonworks.dataplane.http.JsonSupport._
import com.typesafe.config.Config
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}
import com.hortonworks.dataplane.commons.domain.profiler.models.Requests.ProfilerMetricRequest
import com.hortonworks.dataplane.commons.domain.profiler.parsers.RequestParser._
import com.hortonworks.dataplane.commons.domain.profiler.parsers.ResponseParser._
import com.hortonworks.dataplane.cs.profiler.{GlobalProfilerConfigs, MetricRetriever}

import scala.concurrent.ExecutionContext.Implicits.global


class DpProfilerRoute @Inject()(
                             private val clusterComponentService: ClusterComponentService,
                             private val clusterHostsService: ClusterHostsService,
                             private val storageInterface: StorageInterface,
                             private val clusterDataApi: ClusterDataApi,
                             private val config:Config,
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
            case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
            case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
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
            var jobName = (js \ "jobName").as[String]
            onComplete(postAndScheduleJob(clusterId, jobName, list)) {
              case Success(res) => res.status match {
                case 200 => complete(success(res.json))
                case 404 => complete(StatusCodes.NotFound, notFound)
                case _ => complete(res.status)
              }
              case Failure(th) => th match {
                case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
                case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
              }
            }
          }
        }
      }
    }

  val datasetAssetMapping =
    path("cluster" / LongNumber / "dpprofiler" / "datasetasset" / Segment) { (clusterId,datasetname) =>
      extractRequest { request =>
        post {
          entity(as[JsObject]) { js =>
            var assetIds = (js \ "assetIds").as[Seq[String]]
            onComplete(doDatasetAssetMapping(clusterId, assetIds, datasetname)) {
              case Success(res) => res.status match {
                case 200 => complete(success(res.json))
                case 404 => complete(StatusCodes.NotFound, notFound)
                case _ => complete(res.status)
              }
              case Failure(th) => th match {
                case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
                case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
              }
            }
          }
        }
      }
    }

  val datasetProfiledAssetCount =
    path("cluster" / LongNumber / "dpprofiler" / "datasetasset" / Segment / "assetcount") { (clusterId,datasetname) =>
      get {
        parameters("profilerInstanceName".as[String],
          "startTime".as[Long],
          "endTime".as[Long]) { (profilerInstanceName, startTime, endTime) =>
          onComplete(getDatasetProfiledAssetsCount(clusterId, profilerInstanceName, datasetname, startTime,endTime)) {
            case Success(res) => res.status match {
              case 200 => complete(success(res.json))
              case 404 => complete(StatusCodes.NotFound, notFound)
              case _ => complete(res.status)
            }
            case Failure(th) => th match {
              case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
              case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
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
            case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
            case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
          }
        }
      }
    }

  val scheduleInfo =
    path ("cluster" / LongNumber / "dp-profiler" / "schedule-info" / Segment) { (clusterId, taskName) =>
      get {
        onComplete(getScheduleInfo(clusterId, taskName)) {
          case Success(res) => res.status match {
            case 200 => complete(success(res.json.as[Seq[JsObject]].headOption)) //TODO fix it once gaurav fixes profiler response
            case 404 => complete(StatusCodes.NotFound, notFound)
            case _ => complete(res.status)
          }
          case Failure(th) => th match {
            case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
            case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
          }
        }
      }
    }

  val jobDelete =
    path ("cluster" / LongNumber / "dp-profiler" / "profilers") { clusterId: Long =>
      delete {
        parameters('jobName.as[String]) { jobName =>
          onComplete(deleteProfilerByJobName(clusterId, jobName)) {
            case Success(res) => res.status match {
              case 200 => complete(success(res.json))
              case 404 => complete(StatusCodes.NotFound, notFound)
              case _ => complete(StatusCodes.InternalServerError, badRequest)
            }
            case Failure(th) => th match {
              case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
              case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
            }
          }
        }
      }
    }


  val auditResults =
    path ("cluster" / LongNumber / "dp-profiler" / "audit-results" / Segment / Segment / Segment / Segment) { (clusterId, dbName, tableName, startDate, endDate) =>
      get {
        parameters('userName.?) { userName =>
          onComplete(getAuditResults(clusterId, dbName, tableName, userName.get, startDate, endDate)) {
            case Success(res) => res.status match {
              case 200 => complete(success(res.json))
              case 404 => complete(StatusCodes.NotFound, notFound)
              case 503 => complete(StatusCodes.ServiceUnavailable, serverError)
              case _ => complete(StatusCodes.InternalServerError, serverError)
            }
            case Failure(th) => th match {
              case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
              case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
            }
          }
        }
      }
    }

  val auditActions =
    path ("cluster" / LongNumber / "dp-profiler" / "audit-actions" / Segment / Segment / Segment / Segment) { (clusterId, dbName, tableName, startDate, endDate) =>
      get {
        parameters('userName.?) { userName =>
          onComplete(getAuditActions(clusterId, dbName, tableName, userName.get, startDate, endDate)) {
            case Success(res) => res.status match {
              case 200 => complete(success(res.json))
              case 404 => complete(StatusCodes.NotFound, notFound)
              case 503 => complete(StatusCodes.ServiceUnavailable, serverError)
              case _ => complete(StatusCodes.InternalServerError, serverError)
            }
            case Failure(th) => th match {
              case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
              case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
            }
          }
        }
      }
    }

  val putProfilerState =
    path("cluster" / LongNumber / "dp-profiler" / "profilerinstances" / "state" ) { (clusterId: Long) =>
      extractRequest { request =>
        put {
          val queryString = request.uri.queryString()
          onComplete(putOnProfiler(clusterId, "/profilerinstances/state", queryString.getOrElse(""))) {
            case res => mapResponse(res)
          }
        }
      }
    }

  val getProfilersStatusWithJobSummary =
    path("cluster" / LongNumber / "dp-profiler" / "status" / "jobs-summary") { clusterId =>
      extractRequest { request =>
        get {
          val queryString = request.uri.queryString()
          onComplete(getFromProfiler(clusterId, "/profilerjobs/jobscount", queryString.getOrElse(""))) {
            case res => mapResponse(res)
          }
        }
      }
    }

  val getProfilersStatusWithAssetsCount =
    path("cluster" / LongNumber / "dp-profiler" / "status" / "asset-count") { clusterId =>
      extractRequest { request =>
        get {
          val queryString = request.uri.queryString()
          onComplete(getFromProfiler(clusterId, "/profilerjobs/assetscount", queryString.getOrElse(""))) {
            case res => mapResponse(res)
          }
        }
      }
    }

  val getProfilersJobsStatus =
    path("cluster" / LongNumber / "dp-profiler" / "jobs") { clusterId =>
      extractRequest { request =>
        get {
          val queryString = request.uri.queryString()
          onComplete(getFromProfiler(clusterId, "/profilerjobs", queryString.getOrElse(""))) {
            case res => mapResponse(res)
          }
        }
      }
    }

  val getProfilersHistories =
    path("cluster" / LongNumber / "dp-profiler" / "histories") { clusterId =>
      extractRequest { request =>
        get {
          val queryString = request.uri.queryString()
          onComplete(getFromProfiler(clusterId, "/assetjobhistories/assetcounts", queryString.getOrElse(""))) {
            case res => mapResponse(res)
          }
        }
      }
    }

  private def mapResponse(resposneTry: Try[WSResponse]) = {
    resposneTry match {
      case Success(res) => res.status match {
        case 200 => complete(success(res.json))
        case 404 => complete(StatusCodes.NotFound, notFound)
        case 503 => complete(StatusCodes.ServiceUnavailable, serverError)
        case _ => complete(StatusCodes.InternalServerError, serverError)
      }
      case Failure(th) => th match {
        case th: ServiceNotFound => complete(StatusCodes.MethodNotAllowed, errors(405, "cluster.profiler.service-not-found", "Unable to find Profiler configured for this cluster", th))
        case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "A generic error occured while communicating with Profiler.", th))
      }
    }

  }

  private def getFromProfiler(clusterId: Long, uriPath:String, queryString: String): Future[WSResponse] = {
    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}${uriPath}?$queryString")
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json")
        .get()
    } yield {
      response
    }
  }

  private def putOnProfiler(clusterId: Long, uriPath:String, queryString: String): Future[WSResponse] = {
    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}${uriPath}?$queryString")
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json")
        .put(Json.obj())
    } yield {
      response
    }
  }

  private def getAuditResults(clusterId: Long, dbName: String, tableName: String, userName: String, startDate: String, endDate: String): Future[WSResponse] = {
    val postData = Json.obj(
      "metrics" -> List(Map("metric" -> "hiveagg", "aggType" -> "Daily")),
      "sql" -> (if(userName == "")
                  s"SELECT date, data.`result` from hiveagg_daily where database='$dbName' and table='$tableName' and date >= cast('$startDate' as date) and date <= cast('$endDate' as date) order by date asc"
                else
                  s"SELECT date, `user`.`$userName`.`result` from hiveagg_daily where database='$dbName' and table='$tableName' and date >= cast('$startDate' as date) and date <= cast('$endDate' as date) order by date asc"
        )
    )

    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/assetmetrics")
      tmp <- Future.successful(println(urlToHit))
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
        .post(postData)
    // Add 2 to current the minute(UTC) to make sure profiling starts within 2 minutes from now.
    } yield {
      response
    }
  }

  private def getAuditActions(clusterId: Long, dbName: String, tableName: String, userName: String, startDate: String, endDate: String): Future[WSResponse] = {
    val postData = Json.obj(
      "metrics" -> List(Map("metric" -> "hiveagg", "aggType" -> "Daily")),
      "sql" -> (if(userName == "")
                  s"SELECT date, data.`action` from hiveagg_daily where database='$dbName' and table='$tableName' and date >= cast('$startDate' as date) and date <= cast('$endDate' as date) order by date asc"
              else
                  s"SELECT date, `user`.`$userName`.`action` from hiveagg_daily where database='$dbName' and table='$tableName' and date >= cast('$startDate' as date) and date <= cast('$endDate' as date) order by date asc"
        )
    )

    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/assetmetrics")
      tmp <- Future.successful(println(urlToHit))
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
        .post(postData)
    // Add 2 to current the minute(UTC) to make sure profiling starts within 2 minutes from now.
    } yield {
      response
    }
  }

  val profilerMetrics = path("cluster" / "dp-profiler" / "metrics") {
    parameters('userName.?) { userNameOpt =>
      extractRequest { request =>
        post {
          entity(as[JsObject]) { request =>
            request.validate[ProfilerMetricRequest] match {
              case JsSuccess(metricRequest, _) =>
                userNameOpt.map(userName => {
                  onComplete(
                    retrieveProfilerConfig(metricRequest.clusterId).flatMap(MetricRetriever.retrieveMetrics(ws, _, metricRequest, userName))
                  ) {
                    case Success(results) =>
                      complete(success(Json.toJson(results).as[JsObject]))
                    case Failure(error) =>
                      complete(StatusCodes.InternalServerError, errors(500, "cluster.profiler.generic", "An error occured while communicating with Profiler.", error))
                  }
                }).getOrElse(complete(StatusCodes.BadRequest, errors(405, "cluster.profiler.service-not-found", "Mandatory param userName is missing", new Exception("userName is missing"))))
              case error: JsError =>
                complete(StatusCodes.BadRequest, errors(405, "cluster.profiler.service-not-found", "Invalid payload", new Exception(JsError.toFlatForm(error).toString())))
            }
          }
        }
      }
    }
  }

  private def retrieveProfilerConfig(clusterId: Long): Future[GlobalProfilerConfigs] =
    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/assetmetrics")
    } yield GlobalProfilerConfigs(urlToHit)

  private def deleteProfilerByJobName(clusterId: Long, jobName: String): Future[WSResponse] = {

      for {
        config <- getConfigOrThrowException(clusterId)
        url <- getUrlFromConfig(config)
        baseUrls <- extractUrlsWithIp(url, clusterId)
        urlToHit <- Future.successful(s"${baseUrls.head}/schedules/$jobName")
        response <- ws.url(urlToHit)
          .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
          .delete()
      } yield {
        response
      }
    }

    private def getScheduleInfo(clusterId: Long, taskName: String): Future[WSResponse] = {

      for {
        config <- getConfigOrThrowException(clusterId)
        url <- getUrlFromConfig(config)
        baseUrls <- extractUrlsWithIp(url, clusterId)
        urlToHit <- Future.successful(s"${baseUrls.head}/schedules/$taskName")
        response <- ws.url(urlToHit)
          .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
          .get()
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

  private def getDatasetProfiledAssetsCount(clusterId: Long, profilerInstanceName: String, datasetName: String, startTime: Long, endTime: Long ): Future[WSResponse] = {

    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/datasetasset/assetcount/$datasetName?profilerinstancename=$profilerInstanceName&startTime=$startTime&endTime=$endTime")
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json")
        .get()
    } yield {
      response
    }
  }

  private def postAndScheduleJob(clusterId: Long, jobName: String, list: Seq[String]): Future[WSResponse] = {
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
        .post(Json.obj("name" -> jobName, "cronExpr" -> s"0 ${(2+(Instant.now.getEpochSecond/60)%60)%60} * * * ?", "jobTask"->postData))
      // Add 2 to current the minute(UTC) to make sure profiling starts within 2 minutes from now.
    } yield {
      response
    }
  }

  private def doDatasetAssetMapping(clusterId: Long, assetIds: Seq[String], datasetName: String): Future[WSResponse] = {
    val postData = Json.obj(
      "datasetName" -> datasetName,
      "assetIds" -> assetIds
    )
    for {
      config <- getConfigOrThrowException(clusterId)
      url <- getUrlFromConfig(config)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      urlToHit <- Future.successful(s"${baseUrls.head}/datasetasset")
      echo <- Future.successful(println(s"url to hit for dataset-asset mapping $urlToHit"))
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json")
        .post(postData)
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
        throw ServiceNotFound(
          s"Could not get the service Url from storage - $errors")
    }.recover{
      case e: Throwable =>
        throw ServiceNotFound(
          s"Could not get the service Url from storage - ${e.getMessage}")
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
    val port = properties("dpprofiler.http.port")
    new URL(s"http://$host:$port")
  }

  def extractUrlsWithIp(urlObj: URL, clusterId: Long): Future[Seq[String]] = {
    val isSingleNodeCluster = Try(config.getBoolean("dp.service.ambari.single.node.cluster")).getOrElse(false)

    clusterDataApi.getDataplaneCluster(clusterId)
      .flatMap { dpCluster =>

        (isSingleNodeCluster, dpCluster.behindGateway) match {
          case (_, true) => clusterDataApi.getKnoxUrl(clusterId).map(url => Seq(s"${url.get}/profiler-agent"))
          case (true, false) => clusterDataApi.getAmbariUrl(clusterId).map { ambari =>
            Seq(s"${urlObj.getProtocol}://${new URL(ambari).getHost}:${urlObj.getPort}")
          }
          case (_, _) => clusterHostsService.getHostByClusterAndName(clusterId, urlObj.getHost)
            .map {
              case Right(host) => Seq(s"${urlObj.getProtocol}://${host.ipaddr}:${urlObj.getPort}")
              case Left(errors) => throw new Exception(s"Cannot translate the hostname into an IP address $errors")
            }
        }
      }
  }

}
