package domain

import java.time.LocalDateTime
import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.{Role, UserRole, UserRoles}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class RoleRepo @Inject()(protected val userRepo: UserRepo, protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Roles = TableQuery[RolesTable]
  val UserRoles = TableQuery[UserRolesTable]

  def all(): Future[List[Role]] = db.run {
    Roles.to[List].result
  }

  def insert(roleName: String): Future[Role] = {
    val role = Role(roleName = roleName)
    db.run {
      Roles returning Roles += role
    }
  }

  def getRolesForUser(userName: String): Future[UserRoles] = {
    val query = for {
      users <- userRepo.Users if users.username === userName
      roles <- Roles
      userRoles <- UserRoles if roles.id === userRoles.roleId if users.id === userRoles.userId
    } yield (roles.roleName)

    val result = db.run(query.result)
    result.map(r => com.hortonworks.dataplane.commons.domain.Entities.UserRoles(userName, r))
  }


  def addUserRole(userRole: UserRole): Future[UserRole] = {
    db.run {
      UserRoles returning UserRoles += userRole
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

   final class UserRolesTable(tag: Tag) extends Table[(UserRole)](tag, Some("dataplane"), "users_roles") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def userId = column[Option[Long]]("user_id")

    def roleId = column[Option[Long]]("role_id")

    def user = foreignKey("user_userRole", userId, userRepo.Users)(_.id)

    def role = foreignKey("role_userRole", roleId, Roles)(_.id)

    def * = (id, userId, roleId) <> ((UserRole.apply _).tupled, UserRole.unapply)

  }


}
