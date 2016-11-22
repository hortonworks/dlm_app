package controllers

import javax.inject.Inject

import internal.Jwt
import models.JsonFormats._
import models.{JsonResponses, User, UserRequest, UserView}
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

  def resolve(user: JsObject): Option[UserView] = {
    user.validate[UserView].map { u =>
      Some(u)
    }.getOrElse(None)
  }

  def login = Action.async(parse.json) { request =>

    request.body.validate[UserRequest].map { user =>
      // `user` is an instance of the case class `models.User`
      collection.flatMap(_.find(Json.obj("username"->user.username)).one[JsObject].map { u =>
        if(u.isDefined) {
          resolve(u.get).map{ us =>
            Ok(Json.obj("auth_token"->Jwt.makeJWT(us)))
          }.getOrElse{
            BadRequest(JsonResponses.statusError(s"Cannot generate token for request"))
          }
        }
        else
        Unauthorized(JsonResponses.statusError(s"Cannot find user for request"))
      })
    }.getOrElse(Future.successful(BadRequest(JsonResponses.statusError("Cannot find user"))))
  }

}



