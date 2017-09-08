/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
