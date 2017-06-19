package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities.Errors
import com.typesafe.config.Config
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSClient, WSResponse}
import com.hortonworks.dataplane.cs.Webservice.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class AmbariServiceImpl(config: Config)(implicit ws: WSClient) extends AmbariService {

  private def url =
    Option(System.getProperty("dp.services.cluster.service.uri"))
      .getOrElse(config.getString("dp.services.cluster.service.uri"))

  private def mapToResults(res: WSResponse) = {
    res.status match {
      case 200 => Right(res.json)
      case _ => mapErrors(res)
    }
  }


  override def getAmbariResponse(clusterId: Long, ambariUrl: String): Future[Either[Errors, JsValue]] = {
    ws.url(s"$url/$clusterId/ambari?request=$ambariUrl")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResults)
  }

}
