package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari._
import com.hortonworks.dataplane.commons.domain.Entities.{
  Cluster,
  DataplaneClusterIdentifier,
  Error,
  Errors
}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.ClusterService
import internal.auth.Authenticated
import models.{ClusterHealthData, JsonResponses}
import play.api.Logger
import play.api.mvc._
import play.api.libs.json.Json
import services.ClusterHealthService
import services.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Clusters @Inject()(
    @Named("clusterService") val clusterService: ClusterService,
    val clusterHealthService: ClusterHealthService,
    authenticated: Authenticated,
    ambariService: AmbariService
) extends Controller {

  def list(dpClusterId: Option[Long]) = authenticated.async {
    dpClusterId match {
      case Some(clusterId) => listByDpClusterId(clusterId)
      case None            => listAll()
    }
  }

  private def listByDpClusterId(dpClusterId: Long) = {
    clusterService
      .getLinkedClusters(dpClusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(clusters) => Ok(Json.toJson(clusters))
      }
  }

  private def listAll() = {
    clusterService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(clusters) => Ok(Json.toJson(clusters))
      }
  }

  def create = authenticated.async(parse.json) { request =>
    Logger.info("Received create cluster request")
    request.body
      .validate[Cluster]
      .map { cluster =>
        clusterService
          .create(cluster.copy(userid = request.user.id))
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(cluster) => Ok(Json.toJson(cluster))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def update = authenticated.async(parse.json) { req =>
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def get(clusterId: String) = authenticated.async {
    Logger.info("Received get cluster request")

    clusterService
      .retrieve(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(cluster) => Ok(Json.toJson(cluster))
      }
  }

  def getDetails = authenticated.async(parse.json) { request =>
    implicit val token = request.token
    request.body
      .validate[AmbariDetailRequest]
      .map { req =>
        ambariService
          .getClusterDetails(req)
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(clusterDetails) => Ok(Json.toJson(clusterDetails))
          }

      }
      .getOrElse(Future.successful(BadRequest))

  }

  import models.ClusterHealthData._

  def getHealth(clusterId: Long, summary: Option[Boolean]) =
    authenticated.async { request =>
      Logger.info("Received get cluster health request")
      implicit val token = request.token
      val dpClusterId = request.getQueryString("dpClusterId").get
      ambariService
        .syncCluster(DataplaneClusterIdentifier(dpClusterId.toLong))
        .flatMap {
          case true =>
            clusterHealthService
              .getClusterHealthData(clusterId)
          case false =>
            Future.successful(Left(Errors(Seq(Error("500", "Sync failed")))))
        }
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(clusterHealth) =>
            Ok(summary match {
              case Some(_) =>
                clusterHealth.nameNodeInfo match {
                  case Some(_) =>
                    mapToJson(clusterHealth)
                  case None =>
                    Json.obj(
                      "nodes" -> clusterHealth.hosts.length
                    )
                }
              case None => Json.toJson(clusterHealth)
            })
        }
    }

  private def mapToJson(clusterHealth: ClusterHealthData) = {
    Json.obj(
      "nodes" -> clusterHealth.hosts.length,
      "totalSize" -> humanizeBytes(
        clusterHealth.nameNodeInfo.get.CapacityTotal),
      "usedSize" -> humanizeBytes(clusterHealth.nameNodeInfo.get.CapacityUsed),
      "status" -> Json.obj(
        "state" -> clusterHealth.nameNodeInfo.get.state,
        "since" -> clusterHealth.nameNodeInfo.get.StartTime
          .map(_ =>
            clusterHealth.nameNodeInfo.get.StartTime.get - System
              .currentTimeMillis())
      )
    )
  }

  def getResourceManagerHealth(clusterId: Long) = authenticated.async {
    request =>
      ambariService.getResourceManagerHealth(clusterId).map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(resourceManagerHealth) =>
          Ok(Json.toJson(resourceManagerHealth))
      }
  }

  private def humanizeBytes(bytes: Option[Double]): String = {
    bytes match {
      case Some(bytes) =>
        if (bytes == 0) return "0 Bytes"
        val k = 1024
        val sizes = Array("Bytes ",
                          "KB ",
                          "MB ",
                          "GB ",
                          "TB ",
                          "PB ",
                          "EB ",
                          "ZB ",
                          "YB ")
        val i = Math.floor(Math.log(bytes) / Math.log(k)).toInt

        Math.round(bytes / Math.pow(k, i)) + " " + sizes(i)
      case None => return "NA"
    }
  }

}
