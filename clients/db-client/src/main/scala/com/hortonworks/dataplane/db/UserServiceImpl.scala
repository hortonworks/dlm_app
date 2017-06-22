package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities.{UserInfo, _}
import com.hortonworks.dataplane.db.Webservice.UserService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class UserServiceImpl(config: Config)(implicit ws: WSClient)
    extends UserService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def loadUser(username: String): Future[Either[Errors, User]] = {
    ws.url(s"$url/users?username=$username")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToUser(res)
      }
  }

  override def loadUserById(id: String): Future[Either[Errors, User]] = {
    ws.url(s"$url/users?id=$id")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToUser(res)
      }
  }
  private def mapToUserInfo(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[UserInfo].get)
      case _ => mapErrors(res)
    }
  }
  private def mapToSuccess(res: WSResponse) = {
    res.status match {
      case 200 =>{ Right((res.json \ "results"));Right(true
      )}
      case _ => mapErrors(res)
    }
  }

  private def mapToUser(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results")(0).validate[User].get)
      case _ => mapErrors(res)
    }
  }
  private def mapToUsers(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Seq[User]].get)
      case _ => mapErrors(res)
    }
  }
  private def mapToUsersWithRoles(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Seq[UserInfo]].get)
      case _ => mapErrors(res)
    }
  }

  def mapToRole(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Role].get)
      case _ => mapErrors(res)
    }
  }
  def mapToRoles(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Seq[Role]].get)
      case _ => mapErrors(res)
    }
  }
  private def mapToUserRoles(res: WSResponse) = {
    res.status match {
      case 200 =>Right((res.json \ "results").validate[UserRoles].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToUserRole(res: WSResponse) = {
    res.status match {
      case 200 =>Right((res.json \ "results").validate[UserRole].get)
      case _ => mapErrors(res)
    }
  }


  override def getUserRoles(userName: String): Future[Either[Errors, UserRoles]] = {
    ws.url(s"$url/users/role/$userName")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToUserRoles(res)
      }
  }


  override def addUser(user: User): Future[Either[Errors, User]] = {
    ws.url(s"$url/users")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(user))
      .map(mapToUser)
  }
  override def addUserWithRoles(user: UserInfo): Future[Either[Errors, UserInfo]] = {
    ws.url(s"$url/users/withroles")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(user))
      .map(mapToUserInfo)
  }

  override  def getUserDetail(userName:String): Future[Either[Errors,UserInfo]]={
    ws.url(s"$url/users/detail/$userName")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToUserInfo)
  }

  override def addRole(role: Role): Future[Either[Errors, Role]] = {
    ws.url(s"$url/roles")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(role))
      .map(mapToRole)
  }

  override def addUserRole(
      userRole: UserRole): Future[Either[Errors, UserRole]] = {
    ws.url(s"$url/users/role")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(userRole))
      .map(mapToUserRole(_))
  }
  override  def getUsers(): Future[Either[Errors,Seq[User]]]={
    ws.url(s"$url/users")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map{res=>
        mapToUsers(res)
      }
  }

  override  def getUsersWithRoles(): Future[Either[Errors,Seq[UserInfo]]]={
    ws.url(s"$url/users/all")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map{res=>
        mapToUsersWithRoles(res)
      }
  }


  override  def getRoles():  Future[Either[Errors,Seq[Role]]]={
    ws.url(s"$url/roles")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { mapToRoles(_)
      }
  }

  override def updateActiveAndRoles(userInfo: UserInfo): Future[Either[Errors,Boolean]]= {
    ws.url(s"$url/users/updateActiveAndRoles")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(userInfo))
      .map { res =>
        res.status match {
          case 200 => Right((res.json \ "results").validate[Boolean].get)
          case _ =>mapErrors(res)
        }
      }
  }
}
