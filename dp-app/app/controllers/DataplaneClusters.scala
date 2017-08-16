package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari.AmbariEndpoint
import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneCluster, DataplaneClusterIdentifier, HJwtToken}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DpClusterService
import models.{JsonResponses, WrappedErrorsException}
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc._
import services.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import com.hortonworks.dataplane.commons.auth.Authenticated

class DataplaneClusters @Inject()(
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    ambariService: AmbariService,
    authenticated: Authenticated)
    extends Controller {

  def list = authenticated.async {
    dpClusterService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataplaneClusters) => Ok(Json.toJson(dataplaneClusters))
      }
  }

  def create = authenticated.async(parse.json) { request =>
    implicit val token = request.token
    Logger.info("Received create data centre request")
    request.body
      .validate[DataplaneCluster]
      .map { dataplaneCluster =>
        dpClusterService
          .create(dataplaneCluster.copy(createdBy = request.user.id, ambariUrl = dataplaneCluster.ambariUrl.replaceFirst("/$", "")))
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(dpCluster) =>
              syncCluster(DataplaneClusterIdentifier(dpCluster.id.get))
              Ok(Json.toJson(dpCluster))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  private def syncCluster(dataplaneCluster: DataplaneClusterIdentifier)(implicit hJwtToken: Option[HJwtToken]): Future[Boolean] = {
    ambariService.syncCluster(dataplaneCluster).map { result =>
      Logger.info(s"Asking Cluster service to discover ${dataplaneCluster.id}")
      result
    }

  }

  def retrieve(clusterId: String) = authenticated.async {
    Logger.info("Received retrieve data centre request")
    dpClusterService
      .retrieve(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataplaneCluster) => Ok(Json.toJson(dataplaneCluster))
      }
  }

  def retrieveServices(clusterId: String) = authenticated.async {
    Logger.info("Received retrieve data centre request")
    dpClusterService
      .retrieveServiceInfo(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(clusterServices) => Ok(Json.toJson(clusterServices))
      }
  }

  def update(clusterId: String) = authenticated.async(parse.json) { request =>
    Logger.info("Received update data centre request")
    request.body
      .validate[DataplaneCluster]
      .map { lake =>
        (for {
          cluster <- retrieveClusterById(clusterId)
          newCluster <- Future.successful(cluster.copy(
            id = Some(clusterId.toLong),
            dcName = lake.dcName,
            description = lake.description,
            location= lake.location,
            properties = lake.properties
          ))
          updated <- updateClusterById(clusterId, newCluster)
        } yield {
          Ok(Json.toJson(updated))
        })
        .recover{
          case ex: WrappedErrorsException => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(ex.errors)}"))
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(clusterId: String) = authenticated.async {
    Logger.info("Received delete data centre request")
    dpClusterService
      .delete(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataplaneCluster) => Ok(Json.toJson(dataplaneCluster))
      }
  }

  def ambariCheck = authenticated.async { request =>
    implicit val token = request.token
    dpClusterService.retrieveByAmbariUrl(request.getQueryString("url").get)
      .flatMap{
        case Left(errors) =>
          Future.successful(InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}")))
        case Right(status) =>
          if (status) {
            Future.successful(Ok(Json.obj("alreadyExists" -> true)))
          } else {
            val res = ambariService
              .statusCheck(AmbariEndpoint(request.getQueryString("url").get))
              .map {
                case Left(errors) =>
                  InternalServerError(
                    JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
                case Right(checkResponse) => Ok(Json.toJson(checkResponse))
              }
            res
          }
      }
  }

  private def retrieveClusterById(clusterId: String): Future[DataplaneCluster] = {
    dpClusterService.retrieve(clusterId)
        .map {
          case Left(errors) => throw WrappedErrorsException(errors)
          case Right(cluster) => cluster
        }
  }

  private def updateClusterById(clusterId: String, cluster: DataplaneCluster): Future[DataplaneCluster] = {
    dpClusterService.update(clusterId, cluster)
        .map {
          case Left(errors) => throw WrappedErrorsException(errors)
          case Right(cluster) => cluster
        }
  }

}
