package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari.AmbariEndpoint
import com.hortonworks.dataplane.commons.domain.Entities.Datalake
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.LakeService
import internal.auth.Authenticated
import models.JsonResponses
import org.apache.commons.lang3.exception.ExceptionUtils
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc._
import services.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Lakes @Inject()(@Named("lakeService") val lakeService: LakeService,
                      ambariService: AmbariService)
    extends Controller {

  def list = Authenticated.async {
    lakeService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(lakes) => Ok(Json.toJson(lakes))
      }
  }

  def create = Authenticated.async(parse.json) { request =>
    Logger.info("Received create data centre request")
    request.body
      .validate[Datalake]
      .map { lake =>
        lakeService
          .create(lake.copy(createdBy = request.user.id))
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(lake) => Ok(Json.toJson(lake))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def retrieve(datalakeId: String) = Authenticated.async {
    Logger.info("Received retrieve data centre request")
    lakeService
      .retrieve(datalakeId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(lake) => Ok(Json.toJson(lake))
      }
  }

  def update(datalakeId: String) = Authenticated.async(parse.json) { request =>
    Logger.info("Received update data centre request")
    request.body
      .validate[Datalake]
      .map { lake =>
        lakeService
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

  def delete(datalakeId: String) = Authenticated.async {
    Logger.info("Received delete data centre request")
    lakeService
      .delete(datalakeId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(lake) => Ok(Json.toJson(lake))
      }
  }

  def ambariCheck(url: String) = Authenticated.async {
    ambariService
      .statusCheck(AmbariEndpoint(url))
      .map {
        case 200 => Ok(Json.toJson(Map("ambariStatus" -> 200)))
        case status => ServiceUnavailable(Json.toJson(Map("ambariStatus" -> status)))
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
