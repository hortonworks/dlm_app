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

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities._
import domain.{API, AssetWorkspaceRepo, NotebookWorkspaceRepo}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class NotebookWorkspaces @Inject()(nw: NotebookWorkspaceRepo)(
  implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def makeLink(c: NotebookWorkspace) = {
    Map("workspaces" -> s"${API.workspaces}/${c.workspaceId}")
  }

  def notebookForWorkspace(workspaceId: Long) = Action.async {
    nw.allByWorkspaceId(workspaceId).map { c =>
      success(c.map(a => linkData(a, makeLink(a))))
    }.recoverWith(apiError)
  }

  def add() = Action.async(parse.json) { req =>
    req.body
      .validate[NotebookWorkspace]
      .map { w =>
        nw.insert(w)
          .map { c =>
             success(linkData(c, makeLink(c)))
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def deleteByNotebookId(notebookId:String) = Action.async(parse.json) { req =>
    nw.deleteById(notebookId).map { c =>
      success(c)
    }.recoverWith(apiError)
  }

}
