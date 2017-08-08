package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dataplane.cs.Webservice.RangerService
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
/**
  * Created by dsingh on 7/28/17.
  */
class RangerAttributes @Inject()(
      @Named("rangerService")
      val rangerService: RangerService,
      val authenticated: Authenticated
) extends Controller {

  def getAuditDetails(clusterId: String, dbName: String, tableName: String, offset:String, limit:String, accessType:String, accessResult:String) =
    authenticated.async { req =>
      Logger.info("Received getAuditDetails for entity")
      implicit val token = req.token
      rangerService
        .getAuditDetails(clusterId, dbName, tableName, offset, limit, accessType, accessResult)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case  _    => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }
    }


}
