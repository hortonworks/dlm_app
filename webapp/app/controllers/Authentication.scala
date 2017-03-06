package controllers


import javax.inject.Inject

import internal.Jwt
import models.JsonFormats._
import models._
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

  def signIn = Action.async(parse.json) { request =>
    request.body.validate[Credential].map { credential =>
      // `user` is an instance of the case class `models.User`
      collection.flatMap(_.find(Json.obj("username"->credential.id)).one[User].map { u =>
        if(u.isDefined) {
          resolve(credential.password,u.get).map{ us => {

              val roles = new Array[String](1);
              roles(0) = u.get.userType;

              Ok(
                Json.obj(
                  "id" -> credential.id,
                  "avatar" -> "",
                  "display" -> "",
                  "token" -> Jwt.makeJWT(us),
                  "roles" -> roles
                )
              )
            }
          }.getOrElse{
            Unauthorized(JsonResponses.statusError(s"Cannot find user for request"))
          }
        }
        else
        Unauthorized(JsonResponses.statusError(s"Cannot find user for request"))
      })
    }.getOrElse(Future.successful(BadRequest(JsonResponses.statusError("Cannot parse user request"))))
  }

  def login = Action.async(parse.json) { request =>
    request.body.validate[UserRequest].map { user =>
      // `user` is an instance of the case class `models.User`
      collection.flatMap(_.find(Json.obj("username"->user.username)).one[User].map { u =>
        if(u.isDefined) {
          resolve(user.password,u.get).map{ us =>
            Ok(
              Json.obj(
              "auth_token"->Jwt.makeJWT(us),
              "userType"->u.get.userType)
            )
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



