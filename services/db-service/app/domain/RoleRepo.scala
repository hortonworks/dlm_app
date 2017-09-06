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

package domain

import java.time.LocalDateTime
import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.{Role, UserRole, UserRoles}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future


class RoleRepo @Inject()( protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Roles = TableQuery[RolesTable]

  def all(): Future[List[Role]] = db.run {
    Roles.to[List].result
  }

  def insert(roleName: String): Future[Role] = {
    val role = Role(roleName = roleName)
    db.run {
      Roles returning Roles += role
    }
  }

  def findById(roleId: Long): Future[Option[Role]] = {
    db.run(Roles.filter(_.id === roleId).result.headOption)
  }

  final class RolesTable(tag: Tag) extends Table[Role](tag, Some("dataplane"), "roles") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def roleName = column[String]("name")

    def created = column[Option[LocalDateTime]]("created")

    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id, roleName, created, updated) <> ((Role.apply _).tupled, Role.unapply)
  }



}
