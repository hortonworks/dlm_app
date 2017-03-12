package controllers

import javax.inject._

import domain.Entities.{Permission, Role, UserRole}
import domain.{PermissionsRepo, RoleRepo}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Permissions @Inject()(permissionsRepo: PermissionsRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import domain.API._
  import domain.JsonFormatters._

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
