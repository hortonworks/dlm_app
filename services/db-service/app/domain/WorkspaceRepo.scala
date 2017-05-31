package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.Workspace
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class WorkspaceRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Workspaces = TableQuery[WorkspacesTable]

  def all(): Future[List[Workspace]] = db.run {
    Workspaces.to[List].result
  }

  def insert(workspace: Workspace): Future[Workspace] = {
    db.run {
      Workspaces returning Workspaces += workspace
    }
  }

  def deleteById(workspaceId: Long): Future[Int] = {
    val workspace = db.run(Workspaces.filter(_.id === workspaceId).delete)
    workspace
  }


  def findById(workspaceId: Long): Future[Option[Workspace]] = {
    db.run(Workspaces.filter(_.id === workspaceId).result.headOption)
  }

  def findByUserId(userId: Long): Future[Seq[Workspace]] = {
    db.run(Workspaces.filter(_.createdBy === userId).to[List].result)
  }

  final class WorkspacesTable(tag: Tag) extends Table[Workspace](tag, Some("dataplane"), "dp_workspace") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[String]("description")

    def createdBy = column[Long]("createdBy")

    def created = column[Option[LocalDateTime]]("created")

    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id, name, description, createdBy, created, updated) <> ((Workspace.apply _).tupled, Workspace.unapply)
  }

}
