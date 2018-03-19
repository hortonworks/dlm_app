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

package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.profiler.models.Requests
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken}
import com.hortonworks.dataplane.cs.Webservice.DpProfilerService
import com.typesafe.config.Config
import play.api.libs.json.{JsObject, Json}
import play.api.libs.ws.WSResponse

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import com.hortonworks.dataplane.commons.domain.profiler.parsers.RequestParser._

class DpProfilerServiceImpl (val config: Config)(implicit ws: ClusterWsClient) extends DpProfilerService{


  private def mapResultsGeneric(res: WSResponse) : Either[Errors,JsObject]= {
    res.status match {
      case 200 =>  Right((res.json \ "results" \ "data").as[JsObject])
      case 404 => Left(
        Errors(Seq(
          Error(404, "Not found"))))
      case 405 => Left(
        Errors(Seq(
          Error(405, (res.json \ "errors" \\ "code").head.toString()))))
      case 503 => Left(
        Errors(Seq(
          Error(503, (res.json \ "error" \ "message").toString()))))
      case _ => Left(
        Errors(Seq(
          Error(res.status, (res.json \ "error" \ "message").toString()))))

        //mapErrors(res)
    }
  }

  private def mapToResultsGeneric(res: WSResponse): JsObject = {
    res.status match {
      case 200 =>
        (res.json \ "results").as[JsObject]
      case _ => {
        val logMsg = s"Cs-Client DpProfilerServiceImpl: In mapToResultsGeneric method, result status ${res.status} and result body ${res.body}"
        mapResponseToError(res,Option(logMsg))
      }
    }
  }

  override def startProfilerJob(clusterId: String, dbName: String, tableName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/start-job/$dbName/$tableName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getProfilerJobStatus(clusterId: String, dbName: String, tableName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/job-status/$dbName/$tableName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def deleteProfilerByJobName(clusterId: Long, jobName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/profilers?jobName=$jobName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapResultsGeneric)
  }

  override def startAndScheduleProfilerJob(clusterId: String, jobName: String, assets: Seq[String])(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/start-schedule-job")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .post(Json.obj("list" -> assets, "jobName" -> jobName))
      .map(mapResultsGeneric)

  }

  override def getScheduleInfo(clusterId: String, taskName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/schedule-info/$taskName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getAuditResults(clusterId: String, dbName: String, tableName: String, userName: String, startDate: String, endDate: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/audit-results/$dbName/$tableName/$startDate/$endDate?userName=$userName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getAuditActions(clusterId: String, dbName: String, tableName: String, userName: String, startDate: String, endDate: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/audit-actions/$dbName/$tableName/$startDate/$endDate?userName=$userName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getMetrics(metricRequest: Requests.ProfilerMetricRequest, userName: String)(implicit token: Option[HJwtToken]): Future[Either[Errors, JsObject]] = {
    ws.url(s"$url/cluster/dp-profiler/metrics?userName=$userName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(metricRequest))
      .map(mapResultsGeneric)
  }
  override def datasetAssetMapping(clusterId: String, assetIds: Seq[String], datasetName: String)(implicit token: Option[HJwtToken]) = {
    ws.url(s"$url/cluster/$clusterId/dpprofiler/datasetasset/$datasetName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .post(Json.obj("assetIds" -> assetIds))
      .map(mapToResultsGeneric)
  }


  override def getDatasetProfiledAssetCount(clusterId: String, datasetName: String, profilerInstanceName: String)(implicit token:Option[HJwtToken]): Future[JsObject] = {
    ws.url(s"$url/cluster/$clusterId/dpprofiler/datasetasset/$datasetName/assetcount?profilerInstanceName=$profilerInstanceName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResultsGeneric)
  }

  override def getProfilersStatusWithJobSummary (clusterId: String, queryString: String) (implicit token:Option[HJwtToken]) : Future[JsObject] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/status/jobs-summary?$queryString")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResultsGeneric)
  }

  override def getProfilersStatusWithAssetsCount (clusterId: String, queryString: String) (implicit token:Option[HJwtToken]) : Future[JsObject] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/status/asset-count?$queryString")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResultsGeneric)
  }

  override def getProfilersJobs (clusterId: String, queryString: String) (implicit token:Option[HJwtToken]) : Future[JsObject] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/jobs?$queryString")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResultsGeneric)
  }

}
