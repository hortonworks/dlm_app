package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.LakeService
import internal.KnoxSso
import internal.auth.Authenticated
import models.{JsonResponses, WrappedErrorsException}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class Configuration @Inject()(@Named("lakeService") val lakeService:
                              LakeService,authenticated:Authenticated,
                              appConfiguration: play.api.Configuration,
                              knoxSso: KnoxSso)
  extends Controller {


  def init = authenticated.async { request =>
    for {
      user <- Future.successful(request.user)
      lake <- isLakeSetup()
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
  def appConfig = Action.async{ request =>
    val requestProcol:String=if (request.secure)"https" else "http"
    Future.successful(Ok(
      Json.obj(
        "isSsoConfigured"->knoxSso.isSsoConfigured
      )
    ))
  }


//  code to check if at least one lake has been setup
  private def isLakeSetup(): Future[Boolean] = {
    lakeService.list()
      .flatMap { lakes =>
        lakes match {
          case Left(errors) => Future.failed(WrappedErrorsException(errors))
          case Right(lakes) => Future.successful(lakes.length > 0)
        }
      }
  }

//  stub to check ldap setup later
  private def isAuthSetup(): Future[Boolean] = Future.successful(true)

//  stub to check rbac setup later
  private def isRBACSetup(): Future[Boolean] = Future.successful(false)

}
