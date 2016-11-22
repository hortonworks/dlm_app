package models

import models.UserType.UserType

object UserType extends Enumeration {
  type UserType = Value
  val LOCAL, LDAP = Value
}

case class UserRequest(username:String,
                       password:String)

case class User(username:String,
                password:String,
                userType:UserType,
                admin:Boolean,
                created:String,
                enabled:String)


object JsonFormats {
  import play.api.libs.json.Json

  implicit val userReqFormat = Json.format[UserRequest]
}


