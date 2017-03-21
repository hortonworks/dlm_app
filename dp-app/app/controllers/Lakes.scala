package controllers

import javax.inject.{Inject}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.Datalake
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.LakeService
import internal.auth.Authenticated
import models.JsonResponses
import play.api.{Logger}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Lakes @Inject()(@Named("lakeService") val lakeService: LakeService)
  extends Controller {

  def list = Authenticated.async {
    lakeService.list()
      .map { lakes =>
        lakes match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(lakes) => Ok(Json.toJson(lakes))
        }
      }
  }


  def create = Authenticated.async(parse.json) { request =>
    Logger.info("Received create data centre request")
    request.body.validate[Datalake].map { lake =>
      lakeService.create(lake)
        .map {
          lake => lake match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(lake) => Ok(Json.toJson(lake))
          }
        }
    }.getOrElse(Future.successful(BadRequest))
  }


  def retrieve(datalakeId: String) = Authenticated.async {
    Logger.info("Received retrieve data centre request")
    lakeService.retrieve(datalakeId)
      .map {
        lake => lake match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(lake) => Ok(Json.toJson(lake))
        }
      }
  }


  def update(datalakeId: String) = Authenticated.async(parse.json) { request =>
    Logger.info("Received update data centre request")
    request.body.validate[Datalake].map { lake =>
      lakeService.update(datalakeId, lake)
        .map {
          lake => lake match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(lake) => Ok(Json.toJson(lake))
          }
        }
    }.getOrElse(Future.successful(BadRequest))
  }


  def delete(datalakeId: String) = Authenticated.async {
    Logger.info("Received delete data centre request")
    lakeService.delete(datalakeId)
      .map {
        lake => lake match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(lake) => Ok(Json.toJson(lake))
        }
      }
  }
}
