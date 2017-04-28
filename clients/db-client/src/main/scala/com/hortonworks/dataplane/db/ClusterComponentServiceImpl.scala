package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService, Error, Errors}
import com.hortonworks.dataplane.db.Webserice.ClusterComponentService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class ClusterComponentServiceImpl(config: Config)(implicit ws: WSClient)
    extends ClusterComponentService {

  private val url = config.getString("dp.services.db.service.uri")
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def create(clusterService: ClusterService)
    : Future[Either[Errors, ClusterService]] = {
    ws.url(s"$url/cluster/services")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(clusterService))
      .map(mapToService)
      .recoverWith {
        case e:Exception =>
          Future.successful(Left(Errors(Seq(Error("500",e.getMessage)))))
      }
  }

  private def mapToService(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[ClusterService](
          res,
          r => (r.json \ "results" \\ "data")(0).validate[ClusterService].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToServices(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[ClusterService]](res,
          r =>
            (r.json \ "results" \\ "data").map { d =>
              d.validate[ClusterService].get
            })
      case _ => mapErrors(res)
    }
  }

  override def getServiceByName(clusterId: Long, serviceName: String): Future[Either[Errors, ClusterService]] = {
    ws.url(s"$url/clusters/$clusterId/service/$serviceName")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get
      .map(mapToService)
      .recoverWith {
        case e:Exception =>
          Future.successful(Left(Errors(Seq(Error("500",e.getMessage)))))
      }
  }

  override def getServicesByName(serviceName: String): Future[Either[Errors, Seq[ClusterService]]] = {
    ws.url(s"$url/services/$serviceName")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get
      .map(mapToServices)
  }

  override def updateServiceByName(clusterData: ClusterService): Future[Either[Errors, Boolean]] = {
    ws.url(s"$url/clusters/services")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(clusterData))
      .map { res =>
        res.status match {
          case 200 => Right(true)
          case x => Left(Errors(Seq(Error(x.toString,"Cannot update service"))))
        }
      } .recoverWith {
      case e:Exception =>
        Future.successful(Left(Errors(Seq(Error("500",e.getMessage)))))
    }
  }
}
