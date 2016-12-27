package models

import java.util.Date

import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

case class UserRequest(username: String,
                       password: String)



case class User(username: String,
                password: String,
                userType: String,
                authType:String,
                admin: Boolean,
                created: Date,
                enabled: Boolean = true)

object User {
  val userTypes = Set("USER","ADMIN","SUPERUSER","ANALYSTADMIN","INFRAADMIN")
  val authTypes= Set("LDAP","LOCAL")
}


case class UserView(username: String, password: String, admin: Boolean,userType:String="USER")

object JsonFormats {

  import play.api.libs.json.Json

  implicit val userReqFormat = Json.format[UserRequest]
  implicit val userFormat = Json.format[User]

  implicit val userWrites = Json.writes[User]
  implicit val userReads = Json.reads[User]

  implicit val userViewReads = Json.reads[UserView]

}


