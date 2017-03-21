package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webserice.LakeService
import com.typesafe.config.Config
import play.api.libs.json.{JsResult, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class LakeServiceImpl (config: Config)(implicit ws: WSClient)
    extends LakeService {

  private val url = config.getString("dp.services.db.service.uri")

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[Datalake]]] = {
    ws.url(s"$url/datalakes")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToLakes)
  }

  override def create(dataLake: Datalake): Future[Either[Errors, Datalake]] = {
    ws.url(s"$url/datalakes")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(dataLake))
      .map(mapToLake)
  }

  override def retrieve(dataLakeId: String): Future[Either[Errors, Datalake]] = {
    ws.url(s"$url/datalakes/$dataLakeId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToLake)
  }

  override def update(dataLakeId: String, datalake: Datalake): Future[Either[Errors, Datalake]] = {
    ws.url(s"$url/datalakes/$dataLakeId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get()
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
        extractEntity[Seq[Datalake]](res, r => (r.json \ "results").validate[Seq[Datalake]])
      case _ => mapErrors(res)
    }
  }

  private def mapToLake(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Datalake](res, r => (r.json \ "results").validate[Datalake])
      case _ => mapErrors(res)
    }
  }

  private def mapErrors(res: WSResponse) = {
    Left(extractError(res, r => r.json.validate[Errors]))
  }

  private def extractEntity[T](
      res: WSResponse,
      f: WSResponse => JsResult[T]): Either[Errors, T] = {
    println(res)
    f(res)
      .map({r =>
        println(r)
        Right(r)})
      .getOrElse(Left(Errors(Seq(Error(
        "500",
        s"sCould not parse response from DB - ${Json.stringify(res.json)}")))))
  }

  private def extractError(res: WSResponse,
                           f: WSResponse => JsResult[Errors]): Errors = {
    if (res.body.isEmpty)
      Errors()
    f(res).map(r => r).getOrElse(Errors())
  }
}
