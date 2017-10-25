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
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{Permission, RolePermission, UserPermission}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

@Singleton
class PermissionsRepo @Inject()(
    protected val userRepo: UserRepo,
    protected val roleRepo: RoleRepo,
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Permissions = TableQuery[PermissionsTable]

  def all(): Future[List[Permission]] = db.run {
    Permissions.to[List].result
  }

  def insert(permission: Permission): Future[Permission] = {
    db.run {
      Permissions returning Permissions += permission
    }
  }

  def userPermissions(username: String):Future[UserPermission] = {
    val query = for {
      users <- userRepo.Users if users.username === username
      roles <- roleRepo.Roles
      userRoles <- userRepo.UserRoles  if roles.id === userRoles.roleId if users.id === userRoles.userId
      permissions <- Permissions if roles.id === permissions.roleId
    } yield (roles.roleName, permissions.permission)

    val result = db.run(query.result)
    val perms = result.map { x =>
      x.groupBy(_._1).map { case (k, v) => RolePermission(k, v.map(_._2)) }
    }
    perms.map { p => UserPermission(username,p.toSeq)}
  }

  def findById(permissionId: Long): Future[Option[Permission]] = {
    db.run(Permissions.filter(_.id === permissionId).result.headOption)
  }

  final class PermissionsTable(tag: Tag)
      extends Table[Permission](tag, Some("dataplane"), "permissions") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def permission = column[String]("permission")
    def roleId = column[Option[Long]]("role_id")
    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")
    def role = foreignKey("user", roleId, roleRepo.Roles)(_.id)
    def * =
      (id, permission, roleId, created, updated) <> ((Permission.apply _).tupled, Permission.unapply)
  }

}
