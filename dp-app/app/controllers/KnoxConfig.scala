package controllers

import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.typesafe.scalalogging.Logger
import internal.auth.Authenticated
import models.{JsonResponses, KnoxConfigInfo, KnoxConfiguration}
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.{KnoxConfigurator, LdapService}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class KnoxConfig @Inject()(val ldapService: LdapService,
                           val knoxConfigurator: KnoxConfigurator,
                           authenticated: Authenticated)
    extends Controller {
  val logger = Logger(classOf[KnoxConfig])

  def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.code == "400"))
      BadRequest(Json.toJson(errors.errors))
    else
      InternalServerError(Json.toJson(errors.errors))
  }

  def configure = authenticated.async(parse.json) { request =>
    request.body
      .validate[KnoxConfigInfo]
      .map { ldapConfigInfo: KnoxConfigInfo =>
        ldapService
          .configure(ldapConfigInfo)
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
  def validate = authenticated.async(parse.json) { request =>
    request.body
      .validate[KnoxConfigInfo]
      .map { ldapConf =>
        ldapService
          .validateBindDn(ldapConf)
          .map {
            case Left(errors) => handleErrors(errors)
            case Right(booleanRes) => Ok(Json.toJson(true))
          }
      }
      .getOrElse(
        Future.successful(BadRequest)
      )
  }
  //Configuration is not authenticated as it will be called fro other service
  def configuration = Action.async { req =>
    ldapService.getConfiguredLdap.map {
      case Left(errors) => handleErrors(errors)
      case Right(configurations) =>
        configurations.headOption match {
          //TODO Assuming only one valid ldap configuration. impl can chane later.
          case Some(config) => {
            val knoxLdapConfig = KnoxConfiguration(ldapUrl = config.ldapUrl,
                                                   bindDn = config.bindDn,
                                                   userDnTemplate =
                                                     config.userDnTemplate)
            Ok(Json.toJson(knoxLdapConfig))
          }
          case None =>
            handleErrors(
              Errors(
                Seq(new Error("Exception", "No ldap configuration found"))))
        }
    }
  }

  def knoxStatus = authenticated.async { req =>
    //TODO this is mock call for testing until knox containers could be launched.
    //check if knox is up..
    Future.successful(Ok)
  }
}
