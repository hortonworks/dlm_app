package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.User
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class UserRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Users = TableQuery[UsersTable]

  def all(): Future[List[User]] = db.run {
    Users.to[List].result
  }

  def insert(username: String, password: String): Future[User] = {
    val user = User(username = username, password = password)
    db.run {
      Users returning Users += user
    }
  }

  def deleteByUserId(userId: Long): Future[Int] = {
    db.run(Users.filter(_.id === userId).delete)
  }

  def findByName(userName: String):Future[Option[User]] = {
      db.run(Users.filter(_.username === userName).result.headOption)
  }



  def findById(userId: Long):Future[Option[User]] = {
    db.run(Users.filter(_.id === userId).result.headOption)
  }

  final class UsersTable(tag: Tag) extends Table[User](tag, Some("dataplane"), "dp_users") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def username = column[String]("username")

    def password = column[String]("password")

    def active = column[Option[Boolean]]("active")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id,username, password, active,created,updated) <> ((User.apply _).tupled, User.unapply)
  }

}
