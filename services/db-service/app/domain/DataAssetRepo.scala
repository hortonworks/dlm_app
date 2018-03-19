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
import play.api.libs.json.{JsValue, Json, Reads}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global



@Singleton
class DataAssetRepo @Inject()(
                               protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val AllDatasetAssets = TableQuery[DatasetAssetTable]
  def DatasetAssets = AllDatasetAssets.filter(_.state === "Active")
  def DatasetEditAssets = AllDatasetAssets.filter(_.editFlag === "Mark_Add")


  def allWithDatasetId(datasetId: Long, queryName: String, offset: Long, limit: Long, state: Option[String]): Future[AssetsAndCounts] = {
    val baseTableQuery = if (state.getOrElse("") == "Edit") DatasetEditAssets else DatasetAssets
    db.run(for {
      count <- baseTableQuery.filter(record => record.datasetId === datasetId && record.assetName.like(s"%$queryName%")).length.result
      assets <- baseTableQuery.filter(record => record.datasetId === datasetId && record.assetName.like(s"%$queryName%")).drop(offset).take(limit).to[List].result
    } yield (assets, count)).map {
      case (assets, count) => AssetsAndCounts(assets, count)
    }
  }


  def insert(dataAsset: DataAsset): Future[DataAsset] = {
    db.run {
      AllDatasetAssets returning AllDatasetAssets += dataAsset
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

    def state = column[Option[String]]("state")

    def editFlag = column[Option[String]]("edit_flag")

    def * =
      (id,
        assetType,
        assetName,
        guid,
        assetProperties,
        clusterId,
        datasetId,
        state,
        editFlag) <> ((DataAsset.apply _).tupled, DataAsset.unapply)

  }

}


