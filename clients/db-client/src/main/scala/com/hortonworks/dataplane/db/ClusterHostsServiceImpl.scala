package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{
  ClusterHost,
  ClusterService,
  Error,
  Errors
}
import com.hortonworks.dataplane.db.Webserice.{
  ClusterComponentService,
  ClusterHostsService
}
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class ClusterHostsServiceImpl(config: Config)(implicit ws: WSClient)
    extends ClusterHostsService {

  private val url = config.getString("dp.services.db.service.uri")
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def createOrUpdate(host: ClusterHost): Future[Option[Errors]] = {
    ws.url(s"$url/clusters/hosts")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(host))
      .map { res =>
        res.status match {
          case 200 => None
          case x => Some(Errors(Seq(Error(x.toString, "Cannot update host"))))
        }
      }
      .recoverWith {
        case e: Exception =>
          Future.successful(Some(Errors(Seq(Error("500", e.getMessage)))))
      }

  }

  override def getHostsByCluster(
      clusterId: Long): Future[Either[Errors, Seq[ClusterHost]]] = {
    ws.url(s"$url/clusters/$clusterId/hosts")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get()
      .map(mapToHosts)
  }

  private def mapToHost(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[ClusterHost](
          res,
          r => (r.json \ "results" \\ "data").head.validate[ClusterHost].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToHosts(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[ClusterHost]](res,
                                        r =>
                                          (r.json \ "results" \\ "data").map {
                                            d =>
                                              d.validate[ClusterHost].get
                                        })
      case _ => mapErrors(res)
    }
  }

  override def getHostByClusterAndName(
      clusterId: Long,
      hostName: String): Future[Either[Errors, ClusterHost]] = {
    ws.url(s"$url/clusters/$clusterId/host/$hostName")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get()
      .map(mapToHost)
  }
}
