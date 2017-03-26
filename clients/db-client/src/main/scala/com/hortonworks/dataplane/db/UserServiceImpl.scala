package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webserice.UserService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class UserServiceImpl(config: Config)(implicit ws: WSClient)
    extends UserService {

  private val url = config.getString("dp.services.db.service.uri")

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def loadUser(username: String): Future[Either[Errors, User]] = {
    ws.url(s"$url/users?username=$username")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToUser(res)
      }
  }

  private def mapToUser(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results")(0).validate[User].get)
      case _ => mapErrors(res)
    }
  }

  def mapToRole(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Role].get)
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
    ws.url(s"$url/user-role/user/$userName")
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

  override def addRole(role: Role): Future[Either[Errors, Role]] = {
    ws.url(s"$url/roles")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(role))
      .map(mapToRole)
  }

  override def addUserRole(
      userRole: UserRole): Future[Either[Errors, UserRole]] = {
    ws.url(s"$url/user-roles")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(userRole))
      .map(mapToUserRole(_))
  }
}
