package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{DatasetAndCategoryIds, Workspace}
import com.hortonworks.dataplane.db.Webservice.WorkspaceService
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.Future

class Workspaces @Inject()(@Named("workspaceService") val workspaceService: WorkspaceService,
                           authenticated: Authenticated)
  extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  import scala.concurrent.ExecutionContext.Implicits.global

  def list = authenticated.async {
    workspaceService.list()
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(workspaces) => Ok(Json.toJson(workspaces))
      }
  }

  def retrieve(name : String) = authenticated.async {
    workspaceService.retrieve(name)
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(workspaces) => Ok(Json.toJson(workspaces))
      }
  }

  def listWithCounts = authenticated.async {
    workspaceService.listWithCounts()
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(workspaces) => Ok(Json.toJson(workspaces))
      }
  }

  def create = authenticated.async(parse.json) { request =>
    request.body.validate[Workspace].map { workspace =>
      workspaceService.create(workspace.copy(createdBy = Some(request.user.id.get)))
        .map {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(workspace) => Ok(Json.toJson(workspace))
        }
    }.getOrElse(Future.successful(BadRequest))
  }

}
