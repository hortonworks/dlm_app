package controllers

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dataplane.cs.Webservice.DpProfilerService
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global

class DpProfilerAttributes @Inject()(
      @Named("dpProfilerService")
      val dpProfilerService: DpProfilerService,
      val authenticated: Authenticated
) extends Controller {

  def startProfilerJob(clusterId: String, dbName: String, tableName: String) = {
    authenticated.async { req =>
      Logger.info(s"Received startProfilerJob for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .startProfilerJob(clusterId, dbName, tableName)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case _ => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            }
          }
          case Right(attributes) => Accepted(Json.toJson(attributes))
        }

    }
  }

  def getProfilerJobStatus(clusterId: String, dbName: String, tableName: String) = {
    authenticated.async { req =>
      Logger.info(s"Received getProfilerJobStatus for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .getProfilerJobStatus(clusterId, dbName, tableName)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case _ => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }

    }
  }

}
