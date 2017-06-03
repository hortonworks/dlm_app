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
        case Right(lakes) => Ok(Json.toJson(lakes))
      }
  }

  def create = authenticated.async(parse.json) { request =>
    Logger.info("Received create data centre request")
    request.body
      .validate[DataplaneCluster]
      .map { lake =>
        dpClusterService
          .create(lake.copy(createdBy = request.user.id))
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

  private def syncCluster(datalake: DataplaneCluster): Future[Boolean] = {
    ambariService.syncCluster(datalake).map { result =>
      Logger.info(s"Asking Cluster service to discover ${datalake.ambariUrl}")
      result
    }

  }

  def retrieve(datalakeId: String) = authenticated.async {
    Logger.info("Received retrieve data centre request")
    dpClusterService
      .retrieve(datalakeId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(lake) => Ok(Json.toJson(lake))
      }
  }

  def update(datalakeId: String) = authenticated.async(parse.json) { request =>
    Logger.info("Received update data centre request")
    request.body
      .validate[DataplaneCluster]
      .map { lake =>
        dpClusterService
          .update(datalakeId, lake)
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(lake) => Ok(Json.toJson(lake))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(datalakeId: String) = authenticated.async {
    Logger.info("Received delete data centre request")
    dpClusterService
      .delete(datalakeId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(lake) => Ok(Json.toJson(lake))
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
