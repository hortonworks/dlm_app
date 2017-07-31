package models

import play.api.libs.json.Json

case class UserListInput(users: Seq[String])

case class UsersAndRolesListInput(users: Seq[String], roles: Seq[String])

case class GroupsListInput(groups: Seq[String])

case class GroupsAndRolesListInput(groups: Seq[String], roles: Seq[String])


object UserListInput {
  implicit val userListInputFormat = Json.format[UserListInput]
}

object UsersAndRolesListInput {
  implicit val usersAndRolesListInputFormat = Json.format[UsersAndRolesListInput]
}

object GroupsListInput {
  implicit val groupListInputFormat = Json.format[GroupsListInput]
}

object GroupsAndRolesListInput {
  implicit val usersAndRolesListInputFormat = Json.format[GroupsAndRolesListInput]
}
