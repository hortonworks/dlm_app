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
import com.hortonworks.dataplane.cs.Webservice.RangerService
import com.typesafe.config.Config
import play.api.libs.json.JsObject
import play.api.libs.ws.WSResponse

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Created by dsingh on 7/28/17.
  */

class RangerServiceImpl(config: Config)(implicit ws: ClusterWsClient)
  extends RangerService {

  private def url =
    Option(System.getProperty("dp.services.cluster.service.uri"))
      .getOrElse(config.getString("dp.services.cluster.service.uri"))

  private def mapResultsGeneric(res: WSResponse) : Either[Errors,JsObject]= {
    res.status match {
      case 200 =>  Right((res.json \ "results" \ "data").as[JsObject])
      case 404 => Left(
        Errors(Seq(
          Error("404", (res.json \ "errors" \\ "code").head.toString()))))
      case _ => mapErrors(res)
    }
  }

  override def getAuditDetails(clusterId: String, dbName: String, tableName: String, offset: String, limit: String, accessType:String, accessResult:String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/ranger/audit/$dbName/$tableName?limit=$limit&offset=$offset&accessType=$accessType&accessResult=$accessResult")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getPolicyDetails(clusterId: String, dbName: String, tableName: String, offset: String, limit: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/ranger/policies?limit=$limit&offset=$offset&serviceType=hive&dbName=$dbName&tableName=$tableName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getPolicyDetailsByTagName(clusterId: String, tagName: String, offset: String, limit: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsObject]] = {
    ws.url(s"$url/cluster/$clusterId/ranger/policies?limit=$limit&offset=$offset&serviceType=tag&tagName=$tagName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

}
