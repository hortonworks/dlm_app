package models

import play.api.libs.json.Json
case class UserListInput(users:Seq[String])

object UserListInput {
  implicit val userListInputFormat = Json.format[UserListInput]
}
