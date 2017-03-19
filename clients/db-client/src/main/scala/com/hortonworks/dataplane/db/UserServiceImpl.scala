package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, User, UserRoles}
import com.hortonworks.dataplane.db.Webserice.UserService
import com.typesafe.config.Config
import play.api.libs.json.{JsResult, Json, Reads}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class UserServiceImpl(config:Config)(implicit ws: WSClient) extends UserService{

  private val url = config.getString("dp.services.db.service.uri")

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def loadUser(username: String): Future[Either[Errors,User]] = {
    ws.url(s"$url/user/$username").withHeaders("Accept" -> "application/json").get().map{ res =>
      res.status match {
        case 200 => extractEntity[User](res,r => (r.json \ "results").validate[User])
        case _ =>   Left(extractError(res,r=> (r.json \ "errors").validate[Errors]))
      }
    }
  }

  override def getUserRoles(userName: String): Future[Either[Errors,UserRoles]] = {
    ws.url(s"$url/user-role/user/$userName").withHeaders("Accept" -> "application/json").get().map{ res =>
      res.status match {
        case 200 => extractEntity[UserRoles](res,r => (r.json \ "results").validate[UserRoles])
        case _ =>   Left(extractError(res,r=> (r.json \ "errors").validate[Errors]))
      }
    }
  }

  private def extractEntity[T](res:WSResponse,f:WSResponse => JsResult[T]):Either[Errors,T] = {
    f(res).map(r => Right(r)).getOrElse(Left(Errors(Seq(Error("500",s"sCould not parse response from DB - ${Json.stringify(res.json)}")))))
  }

  private def extractError(res:WSResponse,f:WSResponse => JsResult[Errors]):Errors = {
    if(res.body.isEmpty)
      Errors()
    f(res).map(r => r).getOrElse(Errors())
  }

}
