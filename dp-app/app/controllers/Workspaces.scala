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
import com.hortonworks.dataplane.commons.domain.Entities.Workspace
import com.hortonworks.dataplane.db.Webservice.WorkspaceService
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

class Workspaces @Inject()(@Named("workspaceService") val workspaceService: WorkspaceService)
  extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  import scala.concurrent.ExecutionContext.Implicits.global

  def list = Action.async {
    workspaceService.list()
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(workspaces) => Ok(Json.toJson(workspaces))
      }
  }

  def retrieve(name: String) = Action.async {
    workspaceService.retrieve(name)
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(workspaces) => Ok(Json.toJson(workspaces))
      }
  }

  def create = AuthenticatedAction.async(parse.json) { request =>
    request.body.validate[Workspace].map { workspace =>
      workspaceService.create(workspace.copy(createdBy = Some(request.user.id.get)))
        .map {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(workspace) => Ok(Json.toJson(workspace))
        }
    }.getOrElse(Future.successful(BadRequest))
  }

  def delete(name: String) = Action.async {
    workspaceService.delete(name)
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(i) => Ok(Json.obj("deleted" -> i))
      }
  }

}
