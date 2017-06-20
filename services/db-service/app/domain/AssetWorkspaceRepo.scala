package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{AssetWorkspace, AssetWorkspaceRequest, DataAsset}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class AssetWorkspaceRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider,
                                   protected val assetRepo: DataAssetRepo)
  extends HasDatabaseConfigProvider[DpPgProfile] {

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

  def getAssets(workspaceId: Long): Future[Seq[DataAsset]] = {
    val query = AssetWorkspaces.filter(_.workspaceId === workspaceId)
      .join(assetRepo.DatasetAssets).on(_.assetId === _.id)
      .map(_._2)

    db.run(query.to[List].result)
  }

  def insert(assetWorkspaceRequest: AssetWorkspaceRequest): Future[Seq[DataAsset]] = {
    val assets = assetWorkspaceRequest.dataAssets
    val assetGuids = assets.map(_.guid)

    val query = for {
      existingAssets <- assetRepo.DatasetAssets.filter(_.guid.inSet(assetGuids)).to[List].result
      _ <- {
        val guids = existingAssets.map(_.guid)
        assetRepo.DatasetAssets ++= assets.filter(a => !guids.contains(a.guid))
      }
      assets <- assetRepo.DatasetAssets.filter(_.guid.inSet(assetGuids)).to[List].result
      _ <- AssetWorkspaces.filter(_.workspaceId === assetWorkspaceRequest.workspaceId).delete
      _ <- AssetWorkspaces ++= assets.map(a => AssetWorkspace(a.assetType, a.id.get, assetWorkspaceRequest.workspaceId))
    } yield assets

    db.run(query.transactionally)
  }

  def deleteById(assetWorkspaceId: Long): Future[Int] = {
    val AssetWorkspace = db.run(AssetWorkspaces.filter(_.workspaceId === assetWorkspaceId).delete)
    AssetWorkspace
  }


  final class AssetWorkspacesTable(tag: Tag) extends Table[AssetWorkspace](tag, Some("dataplane"), "data_asset_workspace") {

    def assetType = column[String]("asset_type")

    def assetId = column[Long]("asset_id")

    def workspaceId = column[Long]("workspace_id")

    def * = (assetType, assetId, workspaceId) <> ((AssetWorkspace.apply _).tupled, AssetWorkspace.unapply)
  }

}
