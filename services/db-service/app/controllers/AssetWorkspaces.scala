package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{
  AssetWorkspace,
  DatasetTag
}
import domain.{AssetWorkspaceRepo, CategoryRepo}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class AssetWorkspaces @Inject()(aw: AssetWorkspaceRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def assetsforWorkspace(workspaceId: Long) = Action.async {
//      aw.getAssets(workspaceId)
    Future.successful(Ok)
  }

  def add() = Action.async(parse.json) { req =>
    req.body
      .validate[AssetWorkspace]
      .map { w =>
        aw.insert(w)
          .map { c =>
            success(c)
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
