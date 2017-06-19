package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{AssetWorkspaceRequest, DataAsset, Errors, NotebookWorkspace}
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.{AssetWorkspaceService, NotebookWorkspaceService}
import internal.auth.Authenticated
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

class NotebookWorkspaces @Inject()(@Named("notebookWorkspaceService") val notebookWorkspaceService: NotebookWorkspaceService,
                                   authenticated: Authenticated) extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  import scala.concurrent.ExecutionContext.Implicits.global

  def getNotebooks(workspaceId: Long) = Action.async {
    notebookWorkspaceService.list(workspaceId)
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(assets) => Ok(Json.toJson(assets))
      }
  }

  def add() = Action.async(parse.json) { request =>
    request.body.validate[NotebookWorkspace].map { notebook =>
      notebookWorkspaceService.create(notebook)
        .map {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(assets) => Ok(Json.toJson(assets))
        }
    }.getOrElse(Future.successful(BadRequest))
  }


  def delete(notebookId: String) = Action.async {
    notebookWorkspaceService.delete(notebookId)
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(i) => Ok(Json.obj("deleted" -> i))
      }
  }
}