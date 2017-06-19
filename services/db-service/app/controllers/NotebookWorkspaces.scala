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
