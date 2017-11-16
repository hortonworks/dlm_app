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

import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.typesafe.scalalogging.Logger
import com.hortonworks.dataplane.commons.auth.{
  AuthenticatedAction,
  AuthenticatedRequest
}
import com.hortonworks.dataplane.db.Webservice.ConfigService
import models.{KnoxConfigInfo, KnoxConfigUpdateInfo, KnoxConfiguration}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Action, Controller}
import services.{KnoxConfigurator, LdapService}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import com.google.inject.name.Named

class KnoxConfig @Inject()(
    val ldapService: LdapService,
    val knoxConfigurator: KnoxConfigurator,
    @Named("configService") configService: ConfigService)
    extends Controller {
  val logger = Logger(classOf[KnoxConfig])

  def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.code == "400"))
      BadRequest(Json.toJson(errors.errors))
    else
      InternalServerError(Json.toJson(errors.errors))
  }

  def getRequestHost(request: AuthenticatedRequest[JsValue]) = {
    (request.headers.get("X-Forwarded-Host"), request.headers.get("X-DP-Forwarded-Host")) match {
      case (Some(host), _) => host.split(",")(0)
      case (None, Some(host)) => host.split(",")(0)
      case (None, None) => request.host
    }
  }

  def configure = AuthenticatedAction.async(parse.json) { request =>
    request.body
      .validate[KnoxConfigInfo]
      .map { ldapConfigInfo: KnoxConfigInfo =>
        val requestHost: String = getRequestHost(request)
        ldapService
          .configure(ldapConfigInfo, requestHost)
          .map {
            case Left(errors) => {
              handleErrors(errors)
            }
            case Right(isCreated) => {
              knoxConfigurator.configure()
              Ok(Json.toJson(isCreated))
            }
          }
      }
      .getOrElse(
        Future.successful(BadRequest)
      )
  }
  def updateLdapConfig= AuthenticatedAction.async(parse.json) { request =>
    request.body
      .validate[KnoxConfigUpdateInfo]
      .map { knoxConfig =>
        ldapService.updateKnoxConfig(knoxConfig).map{
          case Left(errors) =>handleErrors(errors)
          case Right(isCreated) =>{
            knoxConfigurator.configure()
            Ok(Json.toJson(isCreated))
          }
        }
      }.getOrElse(
        Future.successful(BadRequest)
      )
  }

  def getLdapConfiguration = Action.async {
    ldapService.getConfiguredLdap.map {
      case Left(errors) => handleErrors(errors)
      case Right(ldapConfigs) =>
        ldapConfigs.length match {
          case 0 => Ok(Json.toJson(false))
          case _ => Ok(Json.toJson(ldapConfigs.head))
        }
    }
  }

  def isKnoxConfigured = Action.async {
    ldapService.getConfiguredLdap.map {
      case Left(errors) => handleErrors(errors)
      case Right(ldapConfigs) =>
        ldapConfigs.length match {
          case 0 =>
            Ok(
              Json.obj(
                "configured" -> false
              ))
          case _ =>
            Ok(
              Json.obj(
                "configured" -> true
              ))
        }
    }
  }

  def validate = AuthenticatedAction.async(parse.json) { request =>
    request.body
      .validate[KnoxConfigInfo]
      .map { ldapConf =>
        ldapService
          .validateBindDn(ldapConf.ldapUrl,ldapConf.bindDn,ldapConf.password)
          .map {
            case Left(errors) => handleErrors(errors)
            case Right(booleanRes) => Ok(Json.toJson(true))
          }
      }
      .getOrElse(
        Future.successful(BadRequest)
      )
  }
  //Configuration is not authenticated as it will be called fro other service from knox agent
  def configuration = Action.async { req =>
    for {
      ldapConfig <- ldapService.getConfiguredLdap
      whitelists <- configService.getConfig("dp.knox.whitelist")
      signedTokenTtl <- configService.getConfig("dp.session.timeout.minutes")
    } yield {
      ldapConfig match {
        case Left(errors) => handleErrors(errors)
        case Right(ldapConfigs) => {
          val whiteListdomains: Option[Seq[String]] = whitelists match {
            case Some(whitelist) => Some(whitelist.configValue.split(","))
            case None => None
          }
          ldapConfigs.headOption match {
            case None =>
              handleErrors(
                Errors(
                  Seq(Error("Exception", "No ldap configuration found"))))
            case Some(ldapConfig) => {

              val userDnTemplate =
                s"${ldapConfig.userSearchAttributeName.get}={0},${ldapConfig.userSearchBase.get}"
              val password=ldapService.getPassword(ldapConfig.bindDn.get)
              val knoxLdapConfig =
                KnoxConfiguration(ldapUrl = ldapConfig.ldapUrl.get,
                                  bindDn = ldapConfig.bindDn,
                                  userDnTemplate = Some(userDnTemplate),
                                  domains = whiteListdomains,
                                  userSearchAttributeName = ldapConfig.userSearchAttributeName,
                                  userSearchBase = ldapConfig.userSearchBase,
                                  password=password,
                  signedTokenTtl= signedTokenTtl match {
                    case Some(ttl) => Option(ttl.configValue.toLong)
                    case None => None
                  })
              Ok(Json.toJson(knoxLdapConfig))
            }
          }
        }
      }
    }
  }
}
