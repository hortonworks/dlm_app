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

  def addUserRole = Action.async(parse.json) { req =>
    req.body
      .validate[UserRole]
      .map { role =>
        val created = roleRepo.addUserRole(role)
        created.map(r => success(linkData(r,getuserRoleMap(r)))).recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def load(roleId:Long) = Action.async {
    roleRepo.findById(roleId).map { ro =>
      ro.map { r =>
        success(r)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }


  def getRolesForUser(userName:String) = Action.async {
      roleRepo.getRolesForUser(userName).map(success(_))
  }

  private def getuserRoleMap(r: UserRole) = {
    Map("user" -> s"$users/${r.userId.get}", "role" -> s"$roles/${r.roleId.get}")
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
