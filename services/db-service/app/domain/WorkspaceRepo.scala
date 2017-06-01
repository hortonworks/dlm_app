package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{Workspace, WorkspacesAndCounts}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class WorkspaceRepo @Inject()(protected val assetWorkspaceRepo: AssetWorkspaceRepo,
                              protected val workspaceAppRepo: WorkspaceAppRepo,
                              protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  import scala.concurrent.ExecutionContext.Implicits.global

  val Workspaces = TableQuery[WorkspacesTable]

  def all(): Future[List[Workspace]] = db.run {
    Workspaces.to[List].result
  }

  def allWithCounts(): Future[List[WorkspacesAndCounts]] = {
    val assetCountQuery = assetWorkspaceRepo.AssetWorkspaces.groupBy(_.workspaceId).map {
      case (s, results) => (s -> results.length)
    }

    val appCountQuery = workspaceAppRepo.WorkspaceApps.groupBy(_.workspaceId).map {
      case (s, results) => (s -> results.length)
    }

    val query = (for {
      ((w, c),a) <- (Workspaces.joinLeft(assetCountQuery).on(_.id === _._1))
        .joinLeft(appCountQuery).on(_._1.id === _._1)
    } yield (w, c, a))

    db.run(query.to[List].result).map {
      rows =>
        rows.map(r => WorkspacesAndCounts(r._1, r._2.getOrElse((0, 0))._2, r._3.getOrElse((0, 0))._2))
    }
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
    db.run(Workspaces.filter(_.createdBy === Option(userId)).to[List].result)
  }

  final class WorkspacesTable(tag: Tag) extends Table[Workspace](tag, Some("dataplane"), "dp_workspace") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def source = column[Long]("source")

    def description = column[String]("description")

    def createdBy = column[Option[Long]]("createdby")

    def created = column[Option[LocalDateTime]]("created")

    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id, name, source, description, createdBy, created, updated) <> ((Workspace.apply _).tupled, Workspace.unapply)
  }

}
