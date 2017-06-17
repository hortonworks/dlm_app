package controllers

import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Entities.Errors
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.typesafe.scalalogging.Logger
import models.KnoxConfigInfo
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.{KnoxConfigurator, LdapService}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class KnoxConfig @Inject()(val ldapService: LdapService,val knoxConfigurator:KnoxConfigurator) extends Controller {
  val logger = Logger(classOf[KnoxConfig])


  def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.code == "400"))
      BadRequest(Json.toJson(errors))
    else
      InternalServerError(Json.toJson(errors))
  }

  def configure = Action.async(parse.json) { request =>
    request.body
      .validate[KnoxConfigInfo]
      .map { ldapConfigInfo: KnoxConfigInfo =>
        ldapService
          .configure(ldapConfigInfo)
          .map {
            case Left(errors) => {
              handleErrors(errors)
            }
            case Right(ldapConf) => {
              //TODO configure knox and restart..

              Ok(Json.toJson(ldapConf))
            }
          }
      }
      .getOrElse(
        Future.successful(BadRequest)
      )
  }
  def validate = Action.async(parse.json) { request =>
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
  def knoxStatus =Action.async{req=>
    //TODO this is mock call for testing until knox containers could be launched.
    //check if knox is up..
    Future.successful(Ok)
  }

  def test= Action.async {req =>
   // knoxConfigurator.configure
    Future.successful(Ok)
  }
}
