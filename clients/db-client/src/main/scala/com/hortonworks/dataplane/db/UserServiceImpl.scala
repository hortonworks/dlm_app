package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webserice.UserService
import com.typesafe.config.Config
import play.api.libs.json.{JsResult, Json, Reads}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class UserServiceImpl(config: Config)(implicit ws: WSClient)
    extends UserService {

  private val url = config.getString("dp.services.db.service.uri")

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def loadUser(username: String): Future[Either[Errors, User]] = {
    ws.url(s"$url/user/$username")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToUser(res)
      }
  }

  private def mapToUser(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[User](res, r => (r.json \ "results").validate[User])
      case _ => mapErrors(res)
    }
  }

  private def mapErrors(res: WSResponse) = {
    Left(extractError(res, r => r.json.validate[Errors]))
  }

  def mapToRole(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Role](res, r => (r.json \ "results").validate[Role])
      case _ => mapErrors(res)
    }
  }

  private def mapToUserRoles(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[UserRoles](res,
                                 r => (r.json \ "results").validate[UserRoles])
      case _ => mapErrors(res)
    }
  }

  private def mapToUserRole(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[UserRole](res,
                                r => (r.json \ "results").validate[UserRole])
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

  private def extractEntity[T](
      res: WSResponse,
      f: WSResponse => JsResult[T]): Either[Errors, T] = {
    f(res)
      .map(r => Right(r))
      .getOrElse(Left(Errors(Seq(Error(
        "500",
        s"sCould not parse response from DB - ${Json.stringify(res.json)}")))))
  }

  private def extractError(res: WSResponse,
                           f: WSResponse => JsResult[Errors]): Errors = {
    if (res.body.isEmpty)
      Errors()
    f(res).map(r => r).getOrElse(Errors())
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
