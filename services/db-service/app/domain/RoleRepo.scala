package domain

import java.time.LocalDateTime
import javax.inject.Inject

import domain.Entities.{Role, UserRole, UserRoles}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class RoleRepo @Inject()(protected val userRepo: UserRepo,protected val dbConfigProvider: DatabaseConfigProvider)  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  private val Roles = TableQuery[RolesTable]
  private val UserRoles = TableQuery[UserRolesTable]

  def all(): Future[List[Role]] = db.run {
    Roles.to[List].result
  }

  def insert(roleName: String): Future[Role] = {
    val role = Role(roleName = roleName)
    db.run {
      Roles returning Roles += role
    }
  }

  def getRolesForUser(userName:String):Future[UserRoles] = {
    val query = for {
      users <- userRepo.Users if users.username === userName
      roles <- Roles
      userRoles <- UserRoles if users.id === userRoles.roleId
    } yield (roles.roleName)

    val result = db.run(query.result)
    result.map( r => domain.Entities.UserRoles(userName,r))
  }


  def addUserRole(userRole:UserRole):Future[UserRole] = {
    db.run {
      UserRoles returning UserRoles += userRole
    }
  }

  def findById(roleId: Long):Future[Option[Role]] = {
    db.run(Roles.filter(_.id === roleId).result.headOption)
  }

  private class RolesTable(tag: Tag) extends Table[Role](tag, Some("dataplane"), "dp_roles") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def roleName = column[String]("name")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id,roleName,created,updated) <> ((Role.apply _).tupled, Role.unapply)
  }

  private class UserRolesTable(tag: Tag) extends Table[(UserRole)](tag, Some("dataplane"), "dp_users_roles"){
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)
    def userId = column[Option[Long]]("userid")
    def roleId = column[Option[Long]]("roleid")

    def user = foreignKey("user", userId, userRepo.Users)(_.id)
    def role = foreignKey("user", userId, Roles)(_.id)

    def * = (id,userId,roleId) <> ((UserRole.apply _).tupled, UserRole.unapply)

  }


}
