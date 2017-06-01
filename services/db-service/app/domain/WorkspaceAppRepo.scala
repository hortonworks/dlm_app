package domain

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{AssetWorkspace, WorkspaceApp}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class WorkspaceAppRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  import scala.concurrent.ExecutionContext.Implicits.global


  val WorkspaceApps = TableQuery[WorkspaceAppsTable]

  def all(): Future[List[WorkspaceApp]] = db.run {
    WorkspaceApps.to[List].result
  }

  def insert(workspaceApp: WorkspaceApp): Future[WorkspaceApp] = {
    db.run {
      WorkspaceApps returning WorkspaceApps += workspaceApp
    }
  }

  def insertAll(workspaceApps: Seq[WorkspaceApp]): Future[Seq[WorkspaceApp]] = {
    db.run {
      WorkspaceApps ++= workspaceApps
      WorkspaceApps.filter(_.workspaceId === workspaceApps.head.workspaceId).to[List].result
    }
  }

  def updateAll(workspaceApps: Seq[WorkspaceApp]): Future[Seq[WorkspaceApp]] = {
    val query = (for {
      _ <- WorkspaceApps.filter(_.workspaceId === workspaceApps.head.workspaceId).delete
      apps <- WorkspaceApps.filter(_.workspaceId === workspaceApps.head.workspaceId).to[List].result
    } yield apps).transactionally

    db.run(query)
  }

  def deleteById(workspaceId: Long): Future[Int] = {
    db.run(WorkspaceApps.filter(_.workspaceId === workspaceId).delete)
  }


  final class WorkspaceAppsTable(tag: Tag) extends Table[WorkspaceApp](tag, Some("dataplane"), "dp_workspace_apps") {

    def appType = column[String]("apptype")

    def appId = column[Long]("appid")

    def workspaceId = column[Long]("workspaceid")

    def * = (appType, appId, workspaceId) <> ((WorkspaceApp.apply _).tupled, WorkspaceApp.unapply)
  }

}
