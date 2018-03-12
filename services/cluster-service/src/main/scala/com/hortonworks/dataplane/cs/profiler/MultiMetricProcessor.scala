/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.cs.profiler

import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.Asset
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.MetricType
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.MetricType.MetricType
import com.hortonworks.dataplane.cs.profiler.MultiMetricProcessor.MetricProcessorType.MetricProcessorType
import com.hortonworks.dataplane.cs.profiler.processors._
import play.api.libs.ws.WSClient

import scala.concurrent.Future

trait MultiMetricProcessor {

  def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, userName: String, clusterId: Long, assets: List[Asset], metricRequests: MetricRequestGroup): Future[MetricResultGroup]
}


object MultiMetricProcessor {

  object MetricProcessorType extends Enumeration {
    type MetricProcessorType = Value
    val TopKUsersPerAssetProcessor, AssetDistributionBySensitivityTagProcessor,
    QueriesAndSensitivityDistributionProcessor,
    SecureAssetAccessUserCountProcessor, SensitivityDistributionProcessor = Value
  }

  private val metricToProcessorRelationship: Map[MetricType, MetricProcessorType] = Map(
    MetricType.TopKUsersPerAsset -> MetricProcessorType.TopKUsersPerAssetProcessor,
    MetricType.AssetDistributionBySensitivityTag -> MetricProcessorType.AssetDistributionBySensitivityTagProcessor,
    MetricType.QueriesAndSensitivityDistribution -> MetricProcessorType.QueriesAndSensitivityDistributionProcessor,
    MetricType.SecureAssetAccessUserCount -> MetricProcessorType.SecureAssetAccessUserCountProcessor,
    MetricType.SensitivityDistribution -> MetricProcessorType.SensitivityDistributionProcessor
  )

  def processorOf(metricType: MetricType): MetricProcessorType = metricToProcessorRelationship(metricType)

  def getProcessor(processorType: MetricProcessorType): Option[MultiMetricProcessor] = {
    processorType match {
      case MetricProcessorType.TopKUsersPerAssetProcessor => Some(TopKUsersPerAssetProcessor)
      case MetricProcessorType.AssetDistributionBySensitivityTagProcessor => Some(AssetDistributionBySensitivityTagProcessor)
      case MetricProcessorType.QueriesAndSensitivityDistributionProcessor => Some(QueriesAndSensitivityDistributionProcessor)
      case MetricProcessorType.SecureAssetAccessUserCountProcessor => Some(SecureAssetAccessUserCountProcessor)
      case MetricProcessorType.SensitivityDistributionProcessor => Some(SensitivityDistributionProcessor)
      case _ => None
    }
  }

}
