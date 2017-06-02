package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{DatasetTag, Errors}
import com.hortonworks.dataplane.db.Webservice.DatasetTagService
import com.typesafe.config.Config
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DatasetTagServiceImpl(config: Config)(implicit ws: WSClient)
    extends DatasetTagService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def query(tags: Seq[DatasetTag]): Future[Either[Errors, Seq[DatasetTag]]] = {
    ws.url(s"$url/categories")
      .withHeaders("Accept" -> "application/json")
      .post(tags)
      .map(mapToDatasetTags)
  }

  override def create(tag: DatasetTag): Future[Either[Errors, DatasetTag]] = {
    ws.url(s"$url/dataset-tags")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(tag))
      .map(mapToDatasetTag)

  }

  private def mapToDatasetTags(res: WSResponse) = {
    res.status match {
      case 200 =>
        Right(((res.json \ "results").as[Seq[JsValue]].map { d =>
          d.validate[DatasetTag].get
        }))
      case _ => mapErrors(res)
    }
  }

  private def mapToDatasetTag(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[DatasetTag](
          res,
          r => (r.json \\ "results")(0).validate[DatasetTag].get)
      case _ => mapErrors(res)
    }
  }
}
