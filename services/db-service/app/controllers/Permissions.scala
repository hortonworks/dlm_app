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

import com.hortonworks.dataplane.commons.domain.Entities.Permission
import domain.PermissionsRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Permissions @Inject()(permissionsRepo: PermissionsRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import domain.API._
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    permissionsRepo.all.map(permissions =>
      success(permissions.map(e =>
        linkData(e, Map("role" -> s"$roles/${e.roleId.get}")))))
  }

  def load(permissionId: Long) = Action.async {
    permissionsRepo
      .findById(permissionId)
      .map { ro =>
        ro.map { r =>
            success(r)
          }
          .getOrElse(NotFound)
      }
      .recoverWith(apiError)
  }


  def userPermissions(username:String) = Action.async {
    permissionsRepo.userPermissions(username).map(success(_))
  }

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[Permission]
      .map { permission =>
        val created = permissionsRepo.insert(permission)
        created
          .map(r => success(linkData(r, Map("role" -> s"$roles/${r.roleId.get}"))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
