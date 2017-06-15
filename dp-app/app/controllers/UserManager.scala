package controllers

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, User}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.Ldap.LdapSearchResult.ldapConfigInfoFormat
import com.hortonworks.dataplane.db.Webservice.UserService
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.LdapService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class UserManager @Inject()(val ldapService: LdapService,@Named("userService") val userService: UserService) extends Controller {
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
  def addLdapUserAsAdmin=Action.async{req=>
    val userNameOpt:Option[String]=req.getQueryString("userName");
    userNameOpt match  {
      case Some(userName)=>{
        val user:User =User(None,userNameOpt.get,"password-dummy",userName,None,Some(true))
        userService.addUser(user)

        Future.successful(Ok)
      }
      case None=>Future.successful(BadRequest)
    }
  }

}
