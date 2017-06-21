package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{DataAsset, _}
import com.hortonworks.dataplane.db.Webservice.{DataAssetService, DataSetService}
import com.typesafe.config.Config
import play.api.libs.json.{JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class DataAssetServiceImpl(config: Config)(implicit ws: WSClient)
  extends DataAssetService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  override def findManagedAssets(clusterId:Long, assets: Seq[String]): Future[Either[Errors, Seq[JsObject]]] = {
    ws.url(s"$url/query-managed-assets?clusterId=$clusterId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(assets))
      .map(mapToJsObject)
  }

  private def mapToJsObject(res: WSResponse): Either[Errors, Seq[JsObject]] = {
    res.status match {
      case 200 => extractEntity[Seq[JsObject]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[JsObject].get })
      case _ => mapErrors(res)
    }
  }

}
