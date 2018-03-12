/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package controllers.helpers

import com.hortonworks.dataplane.commons.domain.Entities.DataAsset
import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.{Asset, AssetType, HiveAssetDefinition}
import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.{CollectionContext, MetricContextType, ProfilerMetricContext}
import com.hortonworks.dataplane.db.Webservice.DataSetService
import play.api.libs.json.JsValue

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object AssetRetriever {

  private val hiveAssetType: String = "hive_table"
  private val qualifiedNameIdentifier: String = "qualifiedName"

  private def mapToHiveAsset(assetProperties: JsValue): Option[Asset] = {
    (assetProperties \ qualifiedNameIdentifier).validate[String].asOpt.map(
      qualifiedName => {
        val dataBaseAndTable = qualifiedName.split("@").head.split("\\.")
        Asset(AssetType.Hive, HiveAssetDefinition(dataBaseAndTable.head, dataBaseAndTable.tail.head))
      }
    )
  }

  private def mapToAsset(dataAsset: DataAsset): Option[Asset] = {
    dataAsset.assetType match {
      case `hiveAssetType` => mapToHiveAsset(dataAsset.assetProperties)
      case _ => None
    }
  }


  def getAssets(context: ProfilerMetricContext, dataSetService: DataSetService): Future[List[Asset]] = {
    context.contextType match {
      case MetricContextType.CLUSTER => Future.successful(List.empty[Asset])
      case MetricContextType.ASSET =>
        context.definition match {
          case asset: Asset if asset.assetType == AssetType.Hive => Future.successful(List(asset))
          case _ => Future.failed(new Exception(s"Unsupported asset : ${context.definition}"))
        }
      case MetricContextType.COLLECTION =>
        context.definition match {
          case CollectionContext(collectionId) =>
            dataSetService.allAssetsWithDatasetId(collectionId).flatMap {
              case Left(errors) => Future.failed(new Exception((errors.errors.map(_.toString) :+ s"Error while retrieving assets for a collection : $collectionId").toString()))
              case Right(dataAssets) =>
                val assets = dataAssets.map(mapToAsset)
                if (assets.exists(_.isEmpty))
                  Future.failed(new Exception(s"Unsupported assets exist in collection : $collectionId"))
                else
                  Future.successful(assets.collect {
                    case Some(value) => value
                  })
            }
          case _ => Future.failed(new Exception(s"Unsupported context : ${context.definition}"))
        }
    }
  }

}
