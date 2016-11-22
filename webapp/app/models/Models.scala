package models

import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

case class UserRequest(username:String,
                       password:String)

case class User(username:String,
                password:String,
                userType:String,
                admin:Boolean,
                created:String,
                enabled:String)

case class UserView(username:String,admin:Boolean)

object JsonFormats {

  import play.api.libs.json.Json

  implicit val userReqFormat = Json.format[UserRequest]
  implicit val userFormat = Json.format[User]

  implicit val userWrites = new Writes[User] {
    def writes(user: User) = Json.obj(
      "username" -> user.username,
      "userType" -> user.userType,
      "admin" -> user.admin,
      "created" -> user.created,
      "enabled" -> user.enabled
    )

  }

  implicit val userReads: Reads[UserView] = (
    (JsPath \ "username").read[String] and
    (JsPath \ "admin").read[Boolean]
    )(UserView.apply _)


}


