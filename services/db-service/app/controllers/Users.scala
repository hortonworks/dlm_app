package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{
  User,
  UserInfo,
  UserRole
}
import domain.API.{roles, users}
import domain.{RolesUtil, UserRepo}
import org.mindrot.jbcrypt.BCrypt
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Random
@Singleton
class Users @Inject()(userRepo: UserRepo, rolesUtil: RolesUtil)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all(username: Option[String]) = Action.async {
    username match {
      case Some(username) =>
        userRepo
          .findByName(username)
          .map { uo =>
            uo.map(u => success(List(u))).getOrElse(notFound)
          }
          .recoverWith(apiError)
      case None =>
        userRepo.all.map(users => success(users)).recoverWith(apiError)
    }

  }
  def getUsers() = Action.async { request =>
    val offset: Long = request.getQueryString("offset").get.toLong
    val pageSize:Long = request.getQueryString("pageSize").get.toLong
    val searchTerm:Option[String] = request.getQueryString("searchTerm")
    userRepo
      .allWithRoles(offset, pageSize, searchTerm)
      .map { users =>
        success(users)
      }
      .recoverWith(apiError)
  }

  def getUserDetail(username:String)=Action.async{
    userRepo.getUserDetail(username).map{ userDetail=>
      success(userDetail)
    }.recoverWith(apiError)
  }

  def load(userId: Long) = Action.async {
    userRepo
      .findById(userId)
      .map { uo =>
        uo.map { u =>
            success(u)
          }
          .getOrElse(NotFound)
      }
      .recoverWith(apiError)
  }

  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[User]
      .map { user =>
        userRepo
          .insert(
            username = user.username,
            password = BCrypt.hashpw(user.password, BCrypt.gensalt()),
            displayname = user.displayname,
            avatar = user.avatar
          )
          .map { u =>
            success(u)
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }
  def updateActiveAndRoles = Action.async(parse.json) { req =>
    req.body
      .validate[UserInfo]
      .map { userInfo =>
        userRepo
          .updateActiveAndRoles(userInfo)
          .map { res =>
            Ok
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))

  }
  def insertWithRoles = Action.async(parse.json) { req =>
    req.body
      .validate[UserInfo]
      .map { userInfo =>
        val password: String =
          BCrypt.hashpw(Random.alphanumeric.toString(), BCrypt.gensalt())
        //TODO check if user exists and throw exception.
        userRepo
          .insertUserWithRoles(userInfo, password)
          .map(userInfo => success(userInfo))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(userId: Long) = Action.async {
    val future = userRepo.deleteByUserId(userId)
    future.map(i => success(i)).recoverWith(apiError)
  }
  def addUserRole = Action.async(parse.json) { req =>
    req.body
      .validate[UserRole]
      .map { role =>
        val created = userRepo.addUserRole(role)
        created
          .map(r => success(linkData(r, getuserRoleMap(r))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }
  def getRolesForUser(userName: String) = Action.async {
    userRepo.getRolesForUser(userName).map(success(_))
  }
  private def getuserRoleMap(r: UserRole) = {
    Map("user" -> s"$users/${r.userId.get}",
        "role" -> s"$roles/${r.roleId.get}")
  }
}
