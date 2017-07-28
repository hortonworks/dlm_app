package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.AmbariService
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class HiveDatabases @Inject()(val ambariService: AmbariService, authenticated: Authenticated) extends Controller {

  def retrieveDb(clusterId: Long) = authenticated.async { request =>
    Logger.info("Received hive databases operation request")
    implicit val token:Option[HJwtToken] = request.token
    ambariService.getHiveDatabases(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(hiveDatabaseResponse) => Ok(Json.toJson(hiveDatabaseResponse))
    }
  }

  def retrieveDbTables(clusterId: Long, dbName: String) = authenticated.async { request =>
    Logger.info("Received hive databases operation request")
    implicit val token:Option[HJwtToken] = request.token
    ambariService.getHiveDatabaseTables(clusterId, dbName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(hiveDatabaseResponse) => Ok(Json.toJson(hiveDatabaseResponse))
    }
  }


}
