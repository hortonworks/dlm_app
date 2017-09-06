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

import com.hortonworks.dataplane.commons.domain.Entities.{Role, UserRole, UserRoles}
import domain.RoleRepo
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Roles @Inject()(roleRepo: RoleRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  import domain.API._

  def all = Action.async {
    roleRepo.all.map(roles => success(roles))
  }

  def load(roleId:Long) = Action.async {
    roleRepo.findById(roleId).map { ro =>
      ro.map { r =>
        success(r)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[Role]
      .map { role =>
        val created = roleRepo.insert(role.roleName)
        created.map(r => Ok(Json.obj("data" -> r))).recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
