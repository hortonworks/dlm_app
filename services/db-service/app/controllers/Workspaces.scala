package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.Workspace
import domain.{WorkspaceRepo}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Workspaces @Inject()(wr: WorkspaceRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    wr.all.map(categorys => success(categorys)).recoverWith(apiError)
  }


  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[Workspace]
      .map { workspace =>
        wr
          .insert(workspace)
          .map { c =>
            success(c)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def load(workspaceId:Long) = Action.async {
    wr.findById(workspaceId).map { uo =>
      uo.map { u =>
        success(u)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(workspaceId: Long) = Action.async { req =>
    val future = wr.deleteById(workspaceId)
    future.map(i => success(i)).recoverWith(apiError)
  }

}
