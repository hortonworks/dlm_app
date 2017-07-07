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

  def list(clusterId: String) = authenticated.async { req =>
    Logger.info("Received get cluster atlas attributes request")
    implicit val token = req.token
    atlasService
      .listQueryAttributes(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(attributes) => Ok(Json.toJson(attributes))
      }
  }

  def getAssetDetails(clusterId: String, atlasGuid: String) =
    authenticated.async { req =>
      Logger.info("Received get properties for entity")
      implicit val token = req.token
      atlasService
        .getAssetDetails(clusterId, atlasGuid)
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(attributes) => Ok(Json.toJson(attributes))
        }
    }

  def getLineage(clusterId: String, atlasGuid: String) = authenticated.async {
    request =>
      Logger.info("Received get lineage")
      implicit val token = request.token
      atlasService
        .getLineage(clusterId, atlasGuid, request.getQueryString("depth"))
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(lineage) => Ok(Json.toJson(lineage))
        }
  }

  def getTypeDefs(clusterId: String, defType: String) = authenticated.async {
    req =>
      Logger.info(s"Received get type def for $defType")
      implicit val token = req.token
      atlasService
        .getTypeDefs(clusterId, defType)
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(typeDefs) => Ok(Json.toJson(typeDefs))
        }
  }
}
