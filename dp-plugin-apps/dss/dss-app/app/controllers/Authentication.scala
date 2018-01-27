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
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.UserService
import org.apache.commons.codec.binary.Base64
import play.api.{Configuration, Logger}
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Left, Try}

class Authentication @Inject()(@Named("userService") val userService: UserService,
                               configuration: Configuration)
    extends Controller {

  val HEADER_FOR_GATEWAY_USER_CTX = "X-DP-User-Info"

  private def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.code == "400"))
      BadRequest(Json.toJson(errors))
    else if (errors.errors.exists(_.code == "403"))
      Forbidden(Json.toJson(errors))
    else if (errors.errors.exists(_.code == "404"))
      NotFound(Json.toJson(errors))
    else if (errors.errors.exists(_.code == "409"))
      Conflict(Json.toJson(errors))
    else
      InternalServerError(Json.toJson(errors))
  }

  def userDetail = AuthenticatedAction.async { request =>
    request.headers
      .get(HEADER_FOR_GATEWAY_USER_CTX)
      .map { egt =>
        val encodedGatewayToken: String = egt
        val userJsonString: String = new String(Base64.decodeBase64(encodedGatewayToken))
        Json.parse(userJsonString)
          .validate[UserContext] match {
            case JsSuccess(userContext, _) => Future.successful(Ok(Json.toJson(userContext)))
            case JsError(error) =>
              Logger.error(s"Error while parsing Gateway token. $error")
              Future.successful(Unauthorized)
            }
      }
      .getOrElse(Future.successful(Unauthorized))
  }

  def getAllRoles = Action.async { req =>
    userService.getRoles().map {
      case Left(errors) => handleErrors(errors)
      case Right(roles) => Ok(Json.toJson(roles))
    }
  }
}
