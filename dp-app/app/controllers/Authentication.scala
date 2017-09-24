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

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, User, UserRoles}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.UserService
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.JsonFormats._
import models.{Credential, JsonResponses}
import org.mindrot.jbcrypt.BCrypt
import play.api.libs.json.Json
import play.api.mvc._
import play.api.Logger
import play.api.Configuration

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Authentication @Inject()(@Named("userService") val userService: UserService,
                               configuration: Configuration)
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

  def userById(userId: String) = Action.async {
    userService.loadUserById(userId).map{
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(user) => Ok(Json.toJson(user))
    }
  }

  def userDetail = AuthenticatedAction.async { request =>
    val username = request.user.username
    for {
      userOp: Either[Errors, User] <- userService.loadUser(username)
      rolesOp: Either[Errors, UserRoles] <- userService.getUserRoles(username)
    } yield {
      userOp match {
        case Left(errors) =>{
          Logger.error(s"user fetch issue while retrieving details for '${username}': {${errors}")
          Ok(Json.obj("user"->"error"))
        }
        case Right(user) =>
          val orElse = getRoles(rolesOp)
         Ok(Json.obj( "id" -> user.username,
           "avatar" -> user.avatar,
           "display" -> user.displayname)
         )
      }
    }
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
                "display" -> user.displayname
              ))
          case false =>
            Unauthorized(
              JsonResponses.statusError(s"The user cannot be verified"))
        }
    }
  }
}
