package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.AmbariService
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class HiveDatabases @Inject()(val ambariService: AmbariService) extends Controller {

  def retrieveDb(clusterId: Long) = Action.async { req =>
    Logger.info("Received hive databases operation request")
    //TODO - @DLM devs : Pull the token header out of the request and pass it into the implicit token like shown below
    // This is all that needs to be done for supporting Knox,
    // provided you use cs-client for accessing the Ambari API's and go through the proxy
    // An easier way is to wrap all of it into an action eg : dp-app/app/internal/auth/AuthAction.scala
    // or you may do this as follows, for now setting it as None
//    implicit val token = req.headers.get("X-DP-Token-Info").map(s =>Some(HJwtToken(s))).getOrElse(None)
    implicit val token:Option[HJwtToken] = None
    ambariService.getHiveDatabases(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(hiveDatabaseResponse) => Ok(Json.toJson(hiveDatabaseResponse))
    }
  }

  def retrieveDbTables(clusterId: Long, dbName: String) = Action.async { req =>
    Logger.info("Received hive databases operation request")
    //TODO - @DLM devs : Pull the token header out of the request and pass it into the implicit token like shown below
    // This is all that needs to be done for supporting Knox,
    // provided you use cs-client for accessing the Ambari API's and go through the proxy
    // An easier way is to wrap all of it into an action eg : dp-app/app/internal/auth/AuthAction.scala
    // or you may do this as follows, for now setting it as None
//    implicit val token = req.headers.get("X-DP-Token-Info").map(s =>Some(HJwtToken(s))).getOrElse(None)
    implicit val token:Option[HJwtToken] = None
    ambariService.getHiveDatabaseTables(clusterId, dbName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(hiveDatabaseResponse) => Ok(Json.toJson(hiveDatabaseResponse))
    }
  }


}
