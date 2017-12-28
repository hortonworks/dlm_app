/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{AssetWorkspaceRequest, DataAsset, Errors, HJwtToken}
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.AssetWorkspaceService
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

class AssetWorkspaces @Inject()(@Named("assetWorkspaceService") val assetWorkspaceService: AssetWorkspaceService,
                                @Named("atlasService") val atlasService: AtlasService) extends Controller {

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

  def getAssets(workspaceId: String) = Action.async {
    assetWorkspaceService.list(workspaceId.toLong)
      .map {
        case Left(errors) => InternalServerError(Json.toJson(errors))
        case Right(assets) => Ok(Json.toJson(assets))
      }
  }

  def add() = AuthenticatedAction.async(parse.json) { request =>
    request.body.validate[AssetWorkspaceRequest].map { req =>
      implicit val token = request.token
      getAssetFromSearch(req).flatMap {
        case Right(assets) =>
          val newReq = req.copy(dataAssets = assets)
          assetWorkspaceService.create(newReq)
            .map {
              case Left(errors) => InternalServerError(Json.toJson(errors))
              case Right(assets) => Ok(Json.toJson(assets))
            }
        case Left(errors) =>
          Future.successful(InternalServerError(Json.toJson(errors)))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

}
