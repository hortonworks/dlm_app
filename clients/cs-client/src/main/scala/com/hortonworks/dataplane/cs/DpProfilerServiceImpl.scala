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

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken}
import com.hortonworks.dataplane.cs.Webservice.DpProfilerService
import com.typesafe.config.Config
import play.api.libs.json.JsObject
import play.api.libs.ws.WSResponse

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class DpProfilerServiceImpl (config: Config)(implicit ws: ClusterWsClient) extends DpProfilerService{

  private def url =
    Option(System.getProperty("dp.services.cluster.service.uri"))
      .getOrElse(config.getString("dp.services.cluster.service.uri"))

  private def mapResultsGeneric(res: WSResponse) : Either[Errors,JsObject]= {
    res.status match {
      case 200 =>  Right((res.json \ "results" \ "data").as[JsObject])
      case 404 => Left(
        Errors(Seq(
          Error("404", "Not found"))))
      case 405 => Left(
        Errors(Seq(
          Error("405", (res.json \ "errors" \\ "code").head.toString()))))
      case _ => mapErrors(res)
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

  override def deleteProfilerByDatasetId(clusterId: Long, datasetId: Long)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/dp-profiler/profilers?datasetId=$datasetId")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapResultsGeneric)
  }

}
