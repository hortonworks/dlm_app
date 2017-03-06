package domain

import java.time.LocalDateTime
import javax.inject.Inject

import domain.Entities.Role
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

class RoleRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  private val Roles = TableQuery[RolesTable]

  def all(): Future[List[Role]] = db.run {
    Roles.to[List].result
  }

  def insert(roleName: String): Future[Role] = {
    val role = Role(roleName = roleName)
    db.run {
      Roles returning Roles += role
    }
  }


  private class RolesTable(tag: Tag) extends Table[Role](tag, Some("dataplane"), "dp_roles") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def roleName = column[String]("name")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id,roleName,created,updated) <> ((Role.apply _).tupled, Role.unapply)
  }

}