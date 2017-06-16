package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{User, UserRole, UserRoles}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class UserRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider,protected val roleRepo: RoleRepo) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Users = TableQuery[UsersTable]
  val UserRoles = TableQuery[UserRolesTable]

  def all(): Future[List[User]] = db.run {
    Users.to[List].result
  }

  def insert(username: String, password: String, displayname: String, avatar: Option[String]): Future[User] = {
//    TODO: generate avatar url from username > gravatar?
    val user = User(username = username, password = password, displayname = displayname, avatar = avatar)
    db.run {
      Users returning Users += user
    }
  }

  def deleteByUserId(userId: Long): Future[Int] = {
    db.run(Users.filter(_.id === userId).delete)
  }

  def findByName(username: String):Future[Option[User]] = {
      db.run(Users.filter(_.username === username).result.headOption)
  }

  def findById(userId: Long):Future[Option[User]] = {
    db.run(Users.filter(_.id === userId).result.headOption)
  }

  def getRolesForUser(userName: String): Future[UserRoles] = {
    val query = for {
      users <- Users if users.username === userName
      roles <- roleRepo.Roles
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

  final class UsersTable(tag: Tag) extends Table[User](tag, Some("dataplane"), "users") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def username = column[String]("user_name")

    def password = column[String]("password")

    def displayname = column[String]("display_name")

    def avatar = column[Option[String]]("avatar")

    def active = column[Option[Boolean]]("active")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id, username, password, displayname, avatar, active, created, updated) <> ((User.apply _).tupled, User.unapply)
  }

  final class UserRolesTable(tag: Tag) extends Table[(UserRole)](tag, Some("dataplane"), "users_roles") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def userId = column[Option[Long]]("user_id")

    def roleId = column[Option[Long]]("role_id")

    def user = foreignKey("user_userRole", userId, Users)(_.id)

    def role = foreignKey("role_userRole", roleId, roleRepo.Roles)(_.id)

    def * = (id, userId, roleId) <> ((UserRole.apply _).tupled, UserRole.unapply)

  }

}
