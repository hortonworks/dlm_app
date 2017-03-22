package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, User, UserRoles}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.UserService
import internal.Jwt
import models.JsonFormats._
import models.{Credential, JsonResponses}
import org.mindrot.jbcrypt.BCrypt
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Authentication @Inject()(@Named("userService") val userService: UserService)
    extends Controller {

  def signIn = Action.async(parse.json) { request =>
    request.body
      .validate[Credential]
      .map { credential =>
        val username = credential.username
        val password = credential.password
        for {
          userOp <- userService.loadUser(username)
          roles <- userService.getUserRoles(username)
        } yield {
          getResponse(password, userOp, roles)
        }
      }
      .getOrElse(Future.successful(
        BadRequest(JsonResponses.statusError("Cannot parse user request"))))
  }


  private def getRoles(roles: Either[Errors, UserRoles]) = {
    if (roles.isRight) {
      roles.right.get.roles
    } else
      Seq[String]()
  }

  private def getResponse(password: String,
                          userOp: Either[Errors, User],
                          roles: Either[Errors, UserRoles]) = {

    userOp match {
      case Left(errors) =>
        Unauthorized(
          JsonResponses.statusError(
            s"Cannot find user for request ${Json.toJson(errors)}"))
      case Right(user) =>
        BCrypt.checkpw(password, user.password) match {
          case true =>
            val orElse = getRoles(roles)
            Ok(
              Json.obj(
                "id" -> user.username,
                "avatar" -> user.avatar,
                "display" -> user.displayname,
                "token" -> Jwt.makeJWT(user),
                "roles" -> orElse
              ))
          case false =>
            Unauthorized(
              JsonResponses.statusError(s"The user cannot be verified"))
        }
    }
  }
}
