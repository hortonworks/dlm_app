package controllers

import javax.inject._

import domain.Entities.Role
import domain.RoleRepo
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Roles @Inject()(roleRepo: RoleRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import domain.JsonFormatters._

  def all = Action.async {
    roleRepo.all.map(roles => success(roles))
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
