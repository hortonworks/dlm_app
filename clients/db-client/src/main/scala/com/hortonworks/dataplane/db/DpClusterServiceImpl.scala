package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.DpClusterService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class DpClusterServiceImpl(config: Config)(implicit ws: WSClient)
  extends DpClusterService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[DataplaneCluster]]] = {
    ws.url(s"$url/dp/clusters")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDpClusters)
  }

  override def create(dpCluster: DataplaneCluster)
  : Future[Either[Errors, DataplaneCluster]] = {
    ws.url(s"$url/dp/clusters")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(dpCluster))
      .map(mapToDpCluster)
  }

  override def retrieve(
                         dpClusterId: Long): Future[Either[Errors, DataplaneCluster]] = {
    ws.url(s"$url/dp/clusters/$dpClusterId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDpCluster)
  }

   override def retrieveServiceInfo(dpClusterId: String): Future[Either[Errors, Seq[ClusterService]]] = {
    ws.url(s"$url/dp/clusters/$dpClusterId/services")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToClusterService)
  }
  override def retrieveByAmbariUrl(
                                    ambariUrl: String): Future[Either[Errors, Boolean]] = {
    ws.url(s"$url/dp/clusters?ambariUrl=$ambariUrl")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapClusterExists)
  }

  override def update(dpClusterId: Long, dpCluster: DataplaneCluster)
  : Future[Either[Errors, DataplaneCluster]] = {
    ws.url(s"$url/dp/clusters/$dpClusterId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(dpCluster))
      .map(mapToDpCluster)
  }

  override def delete(
                       dpClusterId: String): Future[Either[Errors, DataplaneCluster]] = {
    ws.url(s"$url/dp/clusters/$dpClusterId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToDpCluster)
  }

  private def mapToDpClusters(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[DataplaneCluster]](
          res,
          r =>
            (r.json \ "results" \\ "data").map { d =>
              d.validate[DataplaneCluster].get
            })
      case _ => mapErrors(res)
    }
  }

  private def mapToDpCluster(res: WSResponse) = {
    res.status match {
      case x if x == 200 || x == 201 =>
        extractEntity[DataplaneCluster](
          res,
          r =>
            (r.json \ "results" \\ "data").head.validate[DataplaneCluster].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToClusterService(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[ClusterService]](
          res,
          r =>
            (r.json \ "results" \\ "data").map{services => services.validate[ClusterService].get})
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

  private def mapClusterExists(res: WSResponse) = {
    res.status match {
      case 200 =>
        Right(true)
      case 404 => Right(false)
      case _ => mapErrors(res)
    }
  }

  override def updateStatus(
                             dpCluster: DataplaneCluster): Future[Either[Errors, Boolean]] = {
    ws.url(s"$url/dp/clusters/status")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .patch(Json.toJson(dpCluster))
      .map(mapStatus)
  }

  override def update(dpCluster: DataplaneCluster): Future[Either[Errors, DataplaneCluster]] = {
    ws.url(s"$url/dp/clusters")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(dpCluster))
      .map(mapToDpCluster)
  }
}
