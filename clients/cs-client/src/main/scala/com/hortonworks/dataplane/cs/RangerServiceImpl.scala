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
import play.api.libs.json.JsValue
import play.api.libs.ws.WSResponse

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class RangerServiceImpl(val config: Config)(implicit ws: ClusterWsClient)
  extends RangerService {

  private def mapResultsGeneric(res: WSResponse) : Either[Errors,JsValue]= {
    res.status match {
      case 200 =>  Right((res.json \ "results" \ "data").as[JsValue])
      case 404 => Left(
        Errors(Seq(
          Error("404", (res.json \ "errors" \\ "code").head.toString()))))
      case _ => mapErrors(res)
    }
  }

  override def getAuditDetails(clusterId: String, dbName: String, tableName: String, offset: String, limit: String, accessType:String, accessResult:String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]] = {
    ws.url(s"$url/cluster/$clusterId/ranger/audit/$dbName/$tableName?limit=$limit&offset=$offset&accessType=$accessType&accessResult=$accessResult")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getPolicyDetails(clusterId: String, dbName: String, tableName: String, offset: String, limit: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]] = {
    ws.url(s"$url/cluster/$clusterId/ranger/policies?limit=$limit&offset=$offset&serviceType=hive&dbName=$dbName&tableName=$tableName")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def getPolicyDetailsByTagName(clusterId: Long, tags: String, offset: Long, limit: Long)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]] = {
    ws.url(s"$url/cluster/$clusterId/ranger/policies?limit=$limit&offset=$offset&serviceType=tag&tags=$tags")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

}
