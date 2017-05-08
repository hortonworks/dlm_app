package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webserice.LakeService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class LakeServiceImpl(config: Config)(implicit ws: WSClient)
  extends LakeService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[Datalake]]] = {
    ws.url(s"$url/datalakes")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToLakes)
  }

  override def create(datalake: Datalake): Future[Either[Errors, Datalake]] = {
    ws.url(s"$url/datalakes")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(datalake))
      .map(mapToLake)
  }

  override def retrieve(datalakeId: String): Future[Either[Errors, Datalake]] = {
    ws.url(s"$url/datalakes/$datalakeId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToLake)
  }

  override def update(dataLakeId: String,
                      datalake: Datalake): Future[Either[Errors, Datalake]] = {
    ws.url(s"$url/datalakes/$dataLakeId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(datalake))
      .map(mapToLake)
  }

  override def delete(dataLakeId: String): Future[Either[Errors, Datalake]] = {
    ws.url(s"$url/datalakes/$dataLakeId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToLake)
  }

  private def mapToLakes(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[Datalake]](res,
          r =>
            (r.json \ "results" \\ "data").map {
              d =>
                d.validate[Datalake].get
            })
      case _ => mapErrors(res)
    }
  }

  private def mapToLake(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Datalake](
          res,
          r => (r.json \ "results" \\ "data").head.validate[Datalake].get)
      case _ => mapErrors(res)
    }
  }

  private def mapStatus(res: WSResponse) = {
    res.status match {
      case 200 =>
        Right(true)
      case 400 => Right(false)
      case _ => mapErrors(res)
    }
  }

  override def updateStatus(
                             datalake: Datalake): Future[Either[Errors, Boolean]] = {
    ws.url(s"$url/datalakes/status")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .patch(Json.toJson(datalake))
      .map(mapStatus)
  }
}
