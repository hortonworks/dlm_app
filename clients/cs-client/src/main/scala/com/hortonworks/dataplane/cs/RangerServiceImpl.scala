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
    ws.url(s"$url/cluster/$clusterId/ranger/policy/$dbName/$tableName?limit=$limit&offset=$offset")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

}
