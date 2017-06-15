package controllers

import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Entities.Errors
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.Ldap.LdapSearchResult.ldapConfigInfoFormat
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.LdapService

import scala.concurrent.ExecutionContext.Implicits.global

class UserSearch @Inject()(val ldapService: LdapService) extends Controller {
  val logger = Logger(classOf[KnoxConfig])

  def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.code == "400"))
      BadRequest(Json.toJson(errors))
    else
      InternalServerError(Json.toJson(errors))
  }

  def ldapSearch = Action.async {request =>
    val fuzzyMatch:Boolean=request.getQueryString("fuzzyMatch") match {
      case Some(fuzzyMatch) => fuzzyMatch.toBoolean
      case None=>false
    }
    ldapService.search(request.getQueryString("name").get,fuzzyMatch)
      .map {
        case Left(errors) => handleErrors(errors)
        case Right(ldapSearchResult) => {
          println("result==" + ldapSearchResult)
          Ok(Json.toJson(ldapSearchResult))
        }
      }

  }
}
