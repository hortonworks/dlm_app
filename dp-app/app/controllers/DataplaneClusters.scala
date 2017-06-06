package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari.AmbariEndpoint
import com.hortonworks.dataplane.commons.domain.Entities.DataplaneCluster
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DpClusterService
import models.JsonResponses
import org.apache.commons.lang3.exception.ExceptionUtils
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc._
import services.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import internal.auth.Authenticated
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
              syncCluster(dpCluster)
              Ok(Json.toJson(dpCluster))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  private def syncCluster(dataplaneCluster: DataplaneCluster): Future[Boolean] = {
    ambariService.syncCluster(dataplaneCluster).map { result =>
      Logger.info(s"Asking Cluster service to discover ${dataplaneCluster.ambariUrl}")
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

  def update(clusterId: String) = authenticated.async(parse.json) { request =>
    Logger.info("Received update data centre request")
    request.body
      .validate[DataplaneCluster]
      .map { lake =>
        dpClusterService
          .update(clusterId, lake)
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(dataplaneCluster) => Ok(Json.toJson(dataplaneCluster))
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
    ambariService
      .statusCheck(AmbariEndpoint(request.getQueryString("url").get))
      .map {
        case status => Ok(Json.toJson(Map("ambariStatus" -> status)))
      }
      .recoverWith {
        case e: Exception =>
          Future.successful(
            InternalServerError(
              JsonResponses.statusError(e.getMessage,
                                        ExceptionUtils.getStackTrace(e))))
      }
  }

}
