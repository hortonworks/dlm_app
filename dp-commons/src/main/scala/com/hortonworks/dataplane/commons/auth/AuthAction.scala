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

package com.hortonworks.dataplane.commons.auth

import java.security.cert.X509Certificate

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import org.apache.commons.codec.binary.Base64
import play.api.http.Status
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.mvc._
import play.api.{Configuration, Logger}

import scala.concurrent.Future

object AuthenticatedAction extends ActionBuilder[AuthenticatedRequest] {

  val gatewayUserTokenKey = "X-DP-User-Info"
  val gatewayTokenKey = "X-DP-Token-Info"

  def invokeBlock[A](request: Request[A],
                     block: (AuthenticatedRequest[A]) => Future[Result]) = {

    request.headers.get(gatewayUserTokenKey).map { egt =>
      val encodedGatewayToken: String = egt
      val userJsonString: String = new String(
        Base64.decodeBase64(encodedGatewayToken))
      Json.parse(userJsonString).validate[UserContext] match {
        case JsSuccess(userContext, _) =>{
          val user=User(id=userContext.id,
            username = userContext.username,
            password = "",
            displayname = if (userContext.display.isDefined) userContext.display.get else userContext.username,
            avatar = userContext.avatar
          )

          block(setUpAuthContext(request, user))
        }
        case JsError(error) =>
          Logger.error(s"Error while parsing Gateway token. $error")
          //TODO could this be a system error.
          Future.successful(Results.Status(Status.UNAUTHORIZED))
      }
    }.getOrElse(Future.successful(Results.Status(Status.UNAUTHORIZED)))

  }


  private def setUpAuthContext[A](request: Request[A], user: User) = {
    request.headers
      .get(gatewayTokenKey)
      .map { tokenHeader =>
        AuthenticatedRequest[A](user, request, Some(HJwtToken(tokenHeader)))
      }
      .getOrElse(AuthenticatedRequest[A](user, request))
  }
}

trait AuthenticatedRequest[+A] extends Request[A] {
  val token: Option[HJwtToken]
  val user: User
}

object AuthenticatedRequest {
  def apply[A](u: User, r: Request[A], t: Option[HJwtToken] = None) =
    new AuthenticatedRequest[A] {
      def id = r.id

      def tags = r.tags

      def uri = r.uri

      def path = r.path

      def method = r.method

      def version = r.version

      def queryString = r.queryString

      def headers = r.headers

      lazy val remoteAddress = r.remoteAddress

      def username = None

      val body = r.body
      val user = u
      val token = t

      override def secure: Boolean = r.secure

      override def clientCertificateChain: Option[Seq[X509Certificate]] =
        r.clientCertificateChain
    }
}
