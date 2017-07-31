package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{AssetWorkspaceRequest, DataAsset, Errors, HJwtToken}
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.AssetWorkspaceService
import com.hortonworks.dataplane.commons.auth.Authenticated
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.Future

class AssetWorkspaces @Inject()(@Named("assetWorkspaceService") val assetWorkspaceService: AssetWorkspaceService,
                                @Named("atlasService") val atlasService: AtlasService,
                                authenticated: Authenticated) extends Controller {

  import scala.concurrent.ExecutionContext.Implicits.global
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def getAssetFromSearch(req: AssetWorkspaceRequest)(implicit token:Option[HJwtToken]): Future[Either[Errors, Seq[DataAsset]]] = {
    atlasService.searchQueryAssets(req.clusterId.toString, req.assetQueryModels.head).map {
      case Right(entity) =>
        val assets = entity.entities.getOrElse(Nil).map {
          e =>
            DataAsset(None, e.typeName.get,
              e.attributes.get.get("name").get,
              e.guid.get, Json.toJson(e.attributes.get), req.clusterId)
        }
        Right(assets)
      case Left(e) => Left(e)
    }
  }

  def getAssets(workspaceId: Long) = authenticated.async {
    assetWorkspaceService.list(workspaceId)
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(assets) => Ok(Json.toJson(assets))
      }
  }

  def add() = authenticated.async(parse.json) { request =>
    request.body.validate[AssetWorkspaceRequest].map { req =>
      implicit val token = request.token
      getAssetFromSearch(req).flatMap {
        case Right(assets) =>
          val newReq = req.copy(dataAssets = assets)
          assetWorkspaceService.create(newReq)
            .map {
              case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case Right(assets) => Ok(Json.toJson(assets))
            }
        case Left(errors) =>
          Future.successful(InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}")))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

}
