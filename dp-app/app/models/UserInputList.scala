package models

import play.api.libs.json.Json
case class UserListInput(users:Seq[String])
case class UsersAndRolesListInput(users:Seq[String],roles:Seq[String])

object UserListInput {
  implicit val userListInputFormat = Json.format[UserListInput]
}
object UsersAndRolesListInput{
  implicit val usersAndRolesListInputFormat = Json.format[UsersAndRolesListInput]
}
