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
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DpClusterService
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.{JsonResponses, WrappedErrorsException}
import play.api.libs.json.Json
import play.api.mvc._
import play.api.Configuration
import services.LdapService

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class Config @Inject()(
                               @Named("dpClusterService") val dpClusterService: DpClusterService,
                               ldapService: LdapService,
                               appConfiguration: Configuration)
  extends Controller {


  def init = AuthenticatedAction.async { request =>
    for {
      user <- Future.successful(request.user)
      lake <- isDpClusterSetUp()
      auth <- isAuthSetup()
      rbac <- isRBACSetup()
    } yield Ok(
      Json.obj(
        "user" -> user,
        "lakeWasInitialized" -> lake,
        "authWasInitialized" -> auth,
        "rbacWasInitialized" -> rbac
      )
    )
  }


//  code to check if at least one lake has been setup
  private def isDpClusterSetUp(): Future[Boolean] = {
    dpClusterService.list()
      .flatMap {
        case Left(errors) => Future.failed(WrappedErrorsException(errors))
        case Right(dataplaneClusters) => Future.successful(dataplaneClusters.length > 0)
      }
  }

//  stub to check ldap setup later
  private def isAuthSetup(): Future[Boolean] = Future.successful(true)

//  stub to check rbac setup later
  private def isRBACSetup(): Future[Boolean] = Future.successful(false)

}
