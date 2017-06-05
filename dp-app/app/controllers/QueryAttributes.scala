package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.cs.Webservice.{AtlasService}
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global

class QueryAttributes @Inject()(
                                 @Named("atlasService")
                                 val atlasService: AtlasService,
                                 val authenticated: Authenticated
                        ) extends Controller {

  def list(clusterId: String) = authenticated.async {
    Logger.info("Received get cluster atlas attributes request")

    atlasService.listQueryAttributes(clusterId)
      .map {
        attributes => attributes match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(attributes) => Ok(Json.toJson(attributes))
        }
      }
  }

  def getProperties(clusterId: String, atlasGuid: String) = authenticated.async {
    Logger.info("Received get properties for entity")

    atlasService.getProperties(clusterId, atlasGuid)
      .map {
        attributes => attributes match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(attributes) => Ok(Json.toJson(attributes))
        }
      }
  }

}
