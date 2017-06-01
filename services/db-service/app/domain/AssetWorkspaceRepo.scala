package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.AssetWorkspace
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class AssetWorkspaceRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  import scala.concurrent.ExecutionContext.Implicits.global


  val AssetWorkspaces = TableQuery[AssetWorkspacesTable]

  def all(): Future[List[AssetWorkspace]] = db.run {
    AssetWorkspaces.to[List].result
  }

  def insert(assetWorkspace: AssetWorkspace): Future[AssetWorkspace] = {
    db.run {
      AssetWorkspaces returning AssetWorkspaces += assetWorkspace
    }
  }

  def insertAll(assetWorkspace: Seq[AssetWorkspace]): Future[Seq[AssetWorkspace]] = {
    db.run {
      AssetWorkspaces ++= assetWorkspace
      AssetWorkspaces.filter(_.workspaceId === assetWorkspace.head.workspaceId).to[List].result
    }
  }

  def updateAll(assetWorkspace: Seq[AssetWorkspace]): Future[Seq[AssetWorkspace]] = {
    val query = (for {
      _ <- AssetWorkspaces.filter(_.workspaceId === assetWorkspace.head.workspaceId).delete
      assets <- AssetWorkspaces.filter(_.workspaceId === assetWorkspace.head.workspaceId).to[List].result
    } yield assets).transactionally

    db.run(query)
  }

  def deleteById(assetWorkspaceId: Long): Future[Int] = {
    val AssetWorkspace = db.run(AssetWorkspaces.filter(_.workspaceId === assetWorkspaceId).delete)
    AssetWorkspace
  }


  final class AssetWorkspacesTable(tag: Tag) extends Table[AssetWorkspace](tag, Some("dataplane"), "dp_data_asset_workspace") {

    def assetType = column[String]("assettype")

    def assetId = column[Long]("assetid")

    def workspaceId = column[Long]("workspaceid")

    def * = (assetType, assetId, workspaceId) <> ((AssetWorkspace.apply _).tupled, AssetWorkspace.unapply)
  }

}
