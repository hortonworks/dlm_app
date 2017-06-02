package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{DataAsset, Workspace}
import domain.{API, WorkspaceRepo}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Workspaces @Inject()(wr: WorkspaceRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def makeLink(w: Workspace) = {
    Map(
      "user" -> s"${API.users}/${w.createdBy.get}",
      "cluster" -> s"${API.clusters}/${w.source}"
    )
  }

  def all = Action.async {
    wr.all.map {
      workspaces =>
        success(workspaces.map(
          workspace => (linkData(workspace, makeLink(workspace)))
        ))
    }.recoverWith(apiError)

  }

  def allWithDetails = Action.async {
    wr.allWithDetails().map {
      workspaces =>
        success(workspaces.map(
          workspace => (linkData(workspace, makeLink(workspace.workspace)))
        ))
    }.recoverWith(apiError)

  }


  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[Workspace]
      .map { workspace =>
        wr
          .insert(workspace)
          .map { c =>
            success(linkData(c, makeLink(c)))
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def load(workspaceId: Long) = Action.async {
    wr.findById(workspaceId).map { uo =>
      uo.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def loadByName(name: String) = Action.async {
    wr.findByName(name).map { uo =>
      uo.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def loadByNameWithDetails(name: String) = Action.async {
    wr.findByNameWithDetails(name).map { uo =>
      uo.map { c =>
        success(linkData(c, makeLink(c.workspace)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def loadByUser(userId: Long) = Action.async {
    wr.findByUserId(userId).map { uo =>
      success(Json.toJson(uo))
    }.recoverWith(apiError)
  }

  def delete(workspaceId: Long) = Action.async { req =>
    val future = wr.deleteById(workspaceId)
    future.map(i => success(i)).recoverWith(apiError)
  }

  def deleteByName(name: String) = Action.async { req =>
    val future = wr.deleteByName(name)
    future.map(i => success(i)).recoverWith(apiError)
  }

}
