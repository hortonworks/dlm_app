package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.AssetWorkspace
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class AssetWorkspaceRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val AssetWorkspaces = TableQuery[AssetWorkspacesTable]

  def all(): Future[List[AssetWorkspace]] = db.run {
    AssetWorkspaces.to[List].result
  }

  def insert(assetWorkspace: AssetWorkspace): Future[AssetWorkspace] = {
    db.run {
      AssetWorkspaces returning AssetWorkspaces += assetWorkspace
    }
  }

  def deleteById(assetWorkspaceId: Long): Future[Int] = {
    val AssetWorkspace = db.run(AssetWorkspaces.filter(_.workspaceId === assetWorkspaceId).delete)
    AssetWorkspace
  }


  final class AssetWorkspacesTable(tag: Tag) extends Table[AssetWorkspace](tag, Some("dataplane"), "dp_categories") {
    
    def assetType = column[String]("assetType")
    def assetId = column[Long]("assetid")
    def workspaceId = column[Long]("workspaceid")

    def * = (assetType,assetId, workspaceId) <> ((AssetWorkspace.apply _).tupled, AssetWorkspace.unapply)
  }

}
