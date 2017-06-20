package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities._
import domain.{API, AssetWorkspaceRepo, CategoryRepo}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class AssetWorkspaces @Inject()(aw: AssetWorkspaceRepo)(
  implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def makeLink(c: DataAsset) = {
    Map("cluster" -> s"${API.clusters}/${c.clusterId}")
  }

  def assetsforWorkspace(workspaceId: Long) = Action.async {
    aw.getAssets(workspaceId).map { c =>
      success(c.map(a => linkData(a, makeLink(a))))
    }.recoverWith(apiError)
  }

  def add() = Action.async(parse.json) { req =>
    req.body
      .validate[AssetWorkspaceRequest]
      .map { w =>
        aw.insert(w)
          .map { c =>
            success(c.map(a => linkData(a, makeLink(a))))
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
