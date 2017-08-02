package controllers

import java.time.{ZoneId, ZonedDateTime}
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities._
import domain.API.{roles, users}
import domain.{RolesUtil, UserRepo}
import org.mindrot.jbcrypt.BCrypt
import play.api.libs.json.Json
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
  /*this gives detail for users who are group managed as well*/
  def getUserContext(userName:String)= Action.async{
    getUserContextInternal(userName).map{
      case None=> NotFound
      case Some(userCtx)=>success(userCtx)
    }.recoverWith(apiError)
  }

  private def getUserContextInternal(userName:String): Future[Option[UserContext]] = {
    userRepo.getUserAndRoles(userName).map {
      case None => None
      case Some(res) => {
        val user = res._1
        val userRoleObj = res._2
        val time = user.updated.get.atZone(ZoneId.systemDefault()).toInstant.getEpochSecond
        val userCtx = UserContext(id = user.id, username = user.username, avatar = user.avatar,
          display = Some(user.displayname), active = user.active, roles = userRoleObj.roles, token = None, password = Some(user.password),
          updatedAt = Some(time), groupManaged = user.groupManaged)
          Some(userCtx)
      }
    }
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
          .updateUserAndRoles(userInfo,upgradeFromGroupManaged=false)
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
        userRepo.findByName(userInfo.userName).flatMap{
          case  None=>{
            userRepo
              .insertUserWithRoles(userInfo, password)
              .map(userInfo => success(userInfo))
              .recoverWith(apiError)
          }
          case Some(user)=>{
            user.groupManaged match {
              case Some(true)=> userRepo
                .updateUserAndRoles(userInfo,upgradeFromGroupManaged=true)
                .map(userInfo => Ok)
                .recoverWith(apiError)
              case _=>{
                Future.successful(Conflict("User already exists"))
              }
            }
           }
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }
  def insertWithGroups = Action.async(parse.json) { req=>
    req.body.validate[UserGroupInfo]
      .map { userGroupInfo =>
        if (userGroupInfo.groupIds.isEmpty){
          Future.successful(BadRequest(Json.toJson(Errors(Seq(Error("Input Error","Group needs to be specified"))))))
        }else{
          val password: String =
            BCrypt.hashpw(Random.alphanumeric.toString(), BCrypt.gensalt())
          userRepo.insertUserWithGroups(userGroupInfo,password)
            .map(userGroupInfo => success(userGroupInfo))
            .recoverWith(apiError)
        }
      }.getOrElse(Future.successful(BadRequest))
  }
  def updateWithGroups = Action.async(parse.json) { req =>
    req.body.validate[UserLdapGroups]
      .map{inp=>
        userRepo.updateUserGroups(inp.userName,inp.ldapGroups).flatMap {res=>
          getUserContextInternal(inp.userName).map{res=>
            res match {
              case Some(userCtx)=>success(userCtx)
              case None=>InternalServerError
            }
          }
        }
      }.getOrElse(Future.successful(BadRequest))
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
    userRepo.getUserAndRoles(userName).map{
      case None=>NotFound
      case Some(res)=>success(res._2)
    }
  }
  private def getuserRoleMap(r: UserRole) = {
    Map("user" -> s"$users/${r.userId.get}",
        "role" -> s"$roles/${r.roleId.get}")
  }
}
