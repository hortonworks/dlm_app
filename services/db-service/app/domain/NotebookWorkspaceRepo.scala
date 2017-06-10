package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{AssetWorkspace, NotebookWorkspace}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class NotebookWorkspaceRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val NotebookWorkspaces = TableQuery[NotebookWorkspacesTable]

  def all(): Future[List[NotebookWorkspace]] = db.run {
    NotebookWorkspaces.to[List].result
  }

  def insert(notebookWorkspace: NotebookWorkspace): Future[NotebookWorkspace] = {
    db.run {
      NotebookWorkspaces returning NotebookWorkspaces += notebookWorkspace
    }
  }

  def deleteById(notebookWorkspaceId: Long): Future[Int] = {
    val AssetWorkspace = db.run(NotebookWorkspaces.filter(_.workspaceId === notebookWorkspaceId).delete)
    AssetWorkspace
  }


  final class NotebookWorkspacesTable(tag: Tag) extends Table[NotebookWorkspace](tag, Some("dataplane"), "notebook_workspace") {

    def notebookId = column[String]("notebook_id")

    def name = column[String]("name")

    def created = column[Option[LocalDateTime]]("created")

    def workspaceId = column[Long]("workspace_id")

    def * = (notebookId, name, created, workspaceId) <> ((NotebookWorkspace.apply _).tupled, NotebookWorkspace.unapply)
  }

}
