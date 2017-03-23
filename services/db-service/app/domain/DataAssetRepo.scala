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
    extends Table[DataAsset](tag, Some("dataplane"), "dp_data_asset") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def assetType = column[String]("assettype")

    def assetName = column[String]("assetname")

    def assetDetails = column[String]("assetdetails")

    def asserUrl = column[String]("asserurl")

    def assetProperties = column[JsValue]("assetproperties")

    def datasetId = column[Long]("datasetid")

    def * =
      (id,
        assetType,
        assetName,
        assetDetails,
        asserUrl,
        assetProperties,
        datasetId
      ) <> ((DataAsset.apply _).tupled, DataAsset.unapply)

  }

}
