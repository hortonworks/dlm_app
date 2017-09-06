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
