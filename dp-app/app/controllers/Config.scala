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
import com.hortonworks.dataplane.db.Webservice.{ConfigService, DpClusterService}
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.typesafe.scalalogging.Logger
import models.WrappedErrorsException
import play.api.libs.json.Json
import play.api.mvc._
import play.api.Configuration
import services.LdapService

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class Config @Inject()(
                        @Named("dpClusterService") val dpClusterService: DpClusterService,
                        ldapService: LdapService,
                        appConfiguration: Configuration,
                        @Named("configService") val configService: ConfigService)
  extends Controller {

  val logger = Logger(classOf[Config])

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

  def getConfig(key: String) = Action.async {
    configService
      .getConfig(key).map {
        case None => Ok("")
        case Some(config) => Ok(config.configValue)
      }
  }

  def getGAProperties() = Action.async {
    configService.getConfig("dps.ga.tracking.enabled").map {
      case None => Ok(Json.obj("enabled" -> false))
      case Some(config) => config.configValue match {
        case "true" => Ok(Json.obj("enabled" -> true))
        case "false" => Ok(Json.obj("enabled" -> false))
        case _ => {
          logger.warn("Config value for GA is not present/not a boolean. Returning false instead.")
          Ok(Json.obj("enabled" -> false))
        }
      }
    }
  }

}
