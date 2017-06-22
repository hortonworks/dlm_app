package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.DataAsset
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class DataAssetRepo @Inject()(
                               protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val DatasetAssets = TableQuery[DatasetAssetTable]

  def allWithDatasetId(datasetId: Long): Future[List[DataAsset]] = db.run {
    DatasetAssets.filter(_.datasetId === datasetId).to[List].result
  }

  def insert(dataAsset: DataAsset): Future[DataAsset] = {
    db.run {
      DatasetAssets returning DatasetAssets += dataAsset
    }
  }

  def findById(id: Long): Future[Option[DataAsset]] = {
    db.run(DatasetAssets.filter(_.id === id).result.headOption)
  }

  def deleteById(id: Long): Future[Int] = {
    db.run(DatasetAssets.filter(_.id === id).delete)
  }

  final class DatasetAssetTable(tag: Tag)
    extends Table[DataAsset](tag, Some("dataplane"), "data_asset") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def assetType = column[String]("asset_type")

    def assetName = column[String]("asset_name")

    def guid = column[String]("guid")

    def assetProperties = column[JsValue]("asset_properties")

    def clusterId = column[Long]("cluster_id")

    def datasetId = column[Option[Long]]("dataset_id")

    def * =
      (id,
        assetType,
        assetName,
        guid,
        assetProperties,
        clusterId,
        datasetId) <> ((DataAsset.apply _).tupled, DataAsset.unapply)

  }

}
