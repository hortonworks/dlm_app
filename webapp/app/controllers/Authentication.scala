package controllers

import javax.inject.Inject

import models.JsonFormats._
import models.{User, UserRequest}
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc._
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.play.json.collection.JSONCollection
import scala.concurrent.ExecutionContext.Implicits.global
import play.modules.reactivemongo.json._

import scala.concurrent.Future


class Authentication @Inject() (val reactiveMongoApi: ReactiveMongoApi)
  extends Controller with MongoController with ReactiveMongoComponents {

  val salt = ""

  def collection = database.map(_.collection[JSONCollection]("users"))

  def login = Action.async(parse.json) { request =>

    request.body.validate[UserRequest].map { user =>
      // `user` is an instance of the case class `models.User`
      collection.flatMap(_.find(Json.obj("username"->user.username)).one[JsObject].map { u =>
        print(u.get)
        Ok(Json.obj("status"->"ok"))
      })
    }.getOrElse(Future.successful(Ok(Json.obj("status"->"ok"))))
  }

}



