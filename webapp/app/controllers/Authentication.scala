package controllers


import javax.inject.Inject

import internal.Jwt
import models.JsonFormats._
import models.{JsonResponses, User, UserRequest, UserView}
import org.mindrot.jbcrypt.BCrypt
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class Authentication @Inject() (val reactiveMongoApi: ReactiveMongoApi)
  extends Controller with MongoController with ReactiveMongoComponents {


  def collection = database.map(_.collection[JSONCollection]("users"))

  def resolve(pw:String,user: User): Option[UserView] = {
    val checkpw: Boolean = BCrypt.checkpw(pw,user.password)
    if(checkpw)
      Some(UserView(user.username,user.password,user.admin))
    else
      None
  }

  def login = Action.async(parse.json) { request =>
    request.body.validate[UserRequest].map { user =>
      // `user` is an instance of the case class `models.User`
      collection.flatMap(_.find(Json.obj("username"->user.username)).one[User].map { u =>
        if(u.isDefined) {
          resolve(user.password,u.get).map{ us =>
            Ok(Json.obj("auth_token"->Jwt.makeJWT(us)))
          }.getOrElse{
            Unauthorized(JsonResponses.statusError(s"Cannot find user for request"))
          }
        }
        else
        Unauthorized(JsonResponses.statusError(s"Cannot find user for request"))
      })
    }.getOrElse(Future.successful(BadRequest(JsonResponses.statusError("Cannot parse user request"))))
  }

}



