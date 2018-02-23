/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{AssetsAndCounts, DataAsset}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class DataAssetRepo @Inject()(
                               protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val DatasetAssets = TableQuery[DatasetAssetTable]

  def allWithDatasetId(datasetId: Long, queryName: String, offset: Long, limit: Long): Future[AssetsAndCounts] = {
    db.run(for {
      count <- DatasetAssets.filter(record => record.datasetId === datasetId && record.assetName.like(s"%$queryName%")).length.result
      assets <- DatasetAssets.filter(record => record.datasetId === datasetId && record.assetName.like(s"%$queryName%")).drop(offset).take(limit).to[List].result
    } yield (assets, count)).map {
      case (assets, count) => AssetsAndCounts(assets, count)
    }
  }

  def allAssetsWithDatasetId(datasetId: Long): Future[List[DataAsset]] = db.run {
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

  def findByGuid(guid: String): Future[Option[DataAsset]] = {
    db.run(DatasetAssets.filter(_.guid === guid).result.headOption)
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
