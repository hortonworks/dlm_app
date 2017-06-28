package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Ambari.{AmbariCheckResponse, AmbariCluster}
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken}
import com.hortonworks.dataplane.commons.domain.{Ambari, Entities}
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService
import com.typesafe.config.Config
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSResponse

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AmbariWebServiceImpl(config: Config)(implicit ws: ClusterWsClient)
    extends AmbariWebService {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def url =
    Option(System.getProperty("dp.services.cluster.service.uri"))
      .getOrElse(config.getString("dp.services.cluster.service.uri"))

  private def mapResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[AmbariCheckResponse](
          res,
          r => (r.json \ "results" \ "data").validate[AmbariCheckResponse].get)
      case _ => mapErrors(res)
    }

  }

  override def checkAmbariStatus(endpoint: Ambari.AmbariEndpoint)(
      implicit token: Option[Entities.HJwtToken])
    : Future[Either[Errors, AmbariCheckResponse]] = {
    ws.url(s"$url/ambari/status")
      .withToken(token)
      .withHeaders("Content-Type" -> "application/json",
                   "Accept" -> "application/json")
      .post(Json.toJson(endpoint))
      .map(mapResponse)
  }

  override def getAmbariDetails(
      ambariDetailRequest: Ambari.AmbariDetailRequest)(
      implicit token: Option[Entities.HJwtToken])
    : Future[Either[Errors, Seq[Ambari.AmbariCluster]]] = {
    ws.url(s"$url/ambari/details")
      .withToken(token)
      .post(Json.toJson(ambariDetailRequest))
      .map { response =>
        if (response.status == 200) {
          val seq = response.json \ "results" \ "data"
          Right(seq.validate[Seq[AmbariCluster]].get)
        } else {
          Left(
            Errors(Seq(
              Error("500", (response.json \ "error" \ "message").as[String]))))
        }
      }
  }

  override def syncAmbari(dpCluster: Entities.DataplaneCluster)(
      implicit token: Option[Entities.HJwtToken]): Future[Boolean] = {
    ws.url(s"$url/cluster/sync")
      .withToken(token)
      .post(Json.toJson(dpCluster))
      .map(_.status == 200)
  }

  private def mapToResults(res: WSResponse) = {
    res.status match {
      case 200 => Right(res.json)
      case _ => mapErrors(res)
    }
  }


  override def requestAmbariApi(clusterId: Long, ambariUrl: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]] = {
    ws.url(s"$url/$clusterId/ambari?request=$ambariUrl")
        .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResults)
  }


}
