package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{DataAsset, DatasetTag, Errors}
import com.hortonworks.dataplane.db.Webservice.DataAssetService
import com.typesafe.config.Config
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DataAssetServiceImpl(config: Config)(implicit ws: WSClient)
    extends DataAssetService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[DataAsset]]] = {
    ws.url(s"$url/data-assets")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataAssets)
  }

  override def create(dataAsset: DataAsset): Future[Either[Errors, DataAsset]] = {
    ws.url(s"$url/data-assets")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(dataAsset))
      .map(mapToDataAsset)

  }

  private def mapToDataAssets(res: WSResponse) = {
    res.status match {
      case 200 =>
        Right(((res.json \ "results").as[Seq[JsValue]].map { d =>
          d.validate[DataAsset].get
        }))
      case _ => mapErrors(res)
    }
  }

  private def mapToDataAsset(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[DataAsset](
          res,
          r => (r.json \\ "results")(0).validate[DataAsset].get)
      case _ => mapErrors(res)
    }
  }
}
