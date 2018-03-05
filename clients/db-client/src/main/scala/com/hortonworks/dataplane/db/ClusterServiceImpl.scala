/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{
  Cluster,
  Error,
  Errors
}
import com.hortonworks.dataplane.db.Webservice.ClusterService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class ClusterServiceImpl(config: Config)(implicit ws: WSClient)
    extends ClusterService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def mapToClusters(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[Cluster]](res,
                                    r =>
                                      (r.json \ "results" \\ "data").map { d =>
                                        d.validate[Cluster].get
                                    })
      case 404 => Left(Errors(Seq(Error(404, "Cluster not found"))))
      case _ => mapErrors(res)
    }
  }

  private def mapToCluster(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Cluster](
          res,
          r => (r.json \ "results" \\ "data").head.validate[Cluster].get)
      case 404 => Left(Errors(Seq(Error(404, "Cluster not found"))))
      case _ => mapErrors(res)
    }
  }

  override def getLinkedClusters(
      dpClusterId: Long): Future[Either[Errors, Seq[Cluster]]] = {
    ws.url(s"$url/dpclusters/$dpClusterId/clusters")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToClusters)
  }

  override def list(): Future[Either[Errors, Seq[Cluster]]] = {
    ws.url(s"$url/clusters")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToClusters)

  }

  override def create(cluster: Cluster): Future[Either[Errors, Cluster]] = {
    ws.url(s"$url/clusters")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(cluster))
      .map(mapToCluster)
  }

  override def retrieve(clusterId: String): Future[Either[Errors, Cluster]] = {
    ws.url(s"$url/clusters/$clusterId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCluster)
  }

}
