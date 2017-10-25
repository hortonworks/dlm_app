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
import com.hortonworks.dataplane.commons.domain.Entities.{
  AssetWorkspaceRequest,
  DataAsset,
  Errors,
  NotebookWorkspace
}
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.{
  AssetWorkspaceService,
  NotebookWorkspaceService
}
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

class NotebookWorkspaces @Inject()(
    @Named("notebookWorkspaceService") val notebookWorkspaceService: NotebookWorkspaceService)
    extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  import scala.concurrent.ExecutionContext.Implicits.global

  def getNotebooks(workspaceId: Long) = Action.async {
    notebookWorkspaceService
      .list(workspaceId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(assets) => Ok(Json.toJson(assets))
      }
  }

  def add() = Action.async(parse.json) { request =>
    request.body
      .validate[NotebookWorkspace]
      .map { notebook =>
        notebookWorkspaceService
          .create(notebook)
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(assets) => Ok(Json.toJson(assets))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(notebookId: String) = Action.async {
    notebookWorkspaceService
      .delete(notebookId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(i) => Ok(Json.obj("deleted" -> i))
      }
  }
}
