package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Errors}
import com.hortonworks.dataplane.db.Webserice.ClusterService
import com.typesafe.config.Config
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class ClusterServiceImpl(config: Config)(implicit ws: WSClient)
    extends ClusterService {

  private val url = config.getString("dp.services.db.service.uri")

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[Cluster]]] = {
    ws.url(s"$url/clusters")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToClusters)

  }

  private def mapToClusters(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[Cluster]](res,
                                    r =>
                                      (r.json \ "results" \\ "data").map { d =>
                                        d.validate[Cluster].get
                                    })
      case _ => mapErrors(res)
    }
  }

  override def getLinkedClusters(
      datalakeId: Long): Future[Either[Errors, Seq[Cluster]]] = {
    ws.url(s"$url/datalakes/$datalakeId/clusters")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToClusters)
  }
}
