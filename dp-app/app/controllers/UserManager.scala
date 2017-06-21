package controllers

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{
  Errors,
  User,
  UserInfo
}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.Ldap.LdapSearchResult.ldapConfigInfoFormat
import com.hortonworks.dataplane.commons.domain.RoleType
import com.hortonworks.dataplane.db.Webservice.UserService
import com.typesafe.scalalogging.Logger
import models.UserListInput
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.LdapService

import scala.collection.mutable
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Left

class UserManager @Inject()(val ldapService: LdapService,
                            @Named("userService") val userService: UserService)
    extends Controller {
  val logger = Logger(classOf[KnoxConfig])

  private def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.code == "400"))
      BadRequest(Json.toJson(errors))
    else
      InternalServerError(Json.toJson(errors))
  }

  def ldapSearch = Action.async { request =>
    val fuzzyMatch: Boolean = request.getQueryString("fuzzyMatch").exists {
      res =>
        res.toBoolean
    }
    ldapService
      .search(request.getQueryString("name").get, fuzzyMatch)
      .map {
        case Left(errors) => handleErrors(errors)
        case Right(ldapSearchResult) =>
          Ok(Json.toJson(ldapSearchResult))
      }

  }
  def addSuperAdminUser = Action.async { req =>
    val userNameOpt: Option[String] = req.getQueryString("userName");
    userNameOpt
      .map { userName =>
        val userInfo: UserInfo = UserInfo(userName = userName,
                                          displayName = userName,
                                          roles = Seq(RoleType.SUPERADMIN))
        userService.addUserWithRoles(userInfo).map {
          case Left(errors) => handleErrors(errors)
          case Right(user) => Ok(Json.toJson(user))
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def addSuperAdminUsers = Action.async(parse.json) { req =>
    req.body
      .validate[UserListInput]
      .map { userList =>
        val futures = userList.users.map { userName =>
          val userInfo: UserInfo = UserInfo(userName = userName,
                                            displayName = userName,
                                            roles = Seq(RoleType.SUPERADMIN))
          userService.addUserWithRoles(userInfo)
        }
        //TODO check of any alternate ways.since it is bulk the json may contain success as well as failures
        val successFullyAdded = mutable.ArrayBuffer.empty[UserInfo]
        val errorsReceived = mutable.ArrayBuffer.empty[Errors]
        Future.sequence(futures).map { respList =>
          respList.foreach {
            case Left(error) => errorsReceived += error
            case Right(userInfo) => successFullyAdded += userInfo
          }
          Ok(Json.toJson(successFullyAdded))
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }
  def listUsers = Action.async { req =>
    userService.getUsers().map {
      case Left(errors) => handleErrors(errors)
      case Right(users) => Ok(Json.toJson(users))
    }
  }
  def adminUpdateUserRolesAndStatus = Action.async(parse.json) { req =>
    req.body
      .validate[UserInfo]
      .map { userInfo =>
        userService.updateActiveAndRoles(userInfo).map {
          case Left(errors) => handleErrors(errors)
          case Right(updated) => Ok(Json.toJson("success"))
        }
        Future.successful(BadRequest)
      }
      .getOrElse(Future.successful(BadRequest))
  }
  def getAllRoles = Action.async { req =>
    userService.getUsers().map {
      case Left(errors) => handleErrors(errors)
      case Right(roles) => Ok(Json.toJson(roles))
    }
  }
}
