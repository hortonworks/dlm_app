package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webserice.LocationService
import com.typesafe.config.Config
import play.api.libs.json.{JsResult, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class LocationServiceImpl(config: Config)(implicit ws: WSClient)
    extends LocationService {

  private val url = config.getString("dp.services.db.service.uri")

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(query: Option[String]): Future[Either[Errors, Seq[Location]]] = {
    val uri = query match {case Some(query) => s"$url/locations?query=$query" case None => s"$url/locations"}
    ws.url(uri)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToLocations)
  }

  private def mapToLocations(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[Location]](res, r => (r.json \ "results").validate[Seq[Location]])
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
