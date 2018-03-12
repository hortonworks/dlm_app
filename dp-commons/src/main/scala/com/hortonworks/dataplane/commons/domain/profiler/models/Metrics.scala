/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.models

import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.MetricType.MetricType

object Metrics {

  object MetricType extends Enumeration {
    type MetricType = Value
    val TopKUsersPerAsset, AssetDistributionBySensitivityTag,
    QueriesAndSensitivityDistribution,
    SecureAssetAccessUserCount, SensitivityDistribution = Value
  }

  trait MetricDefinition

  case class ProfilerMetric(metricType: MetricType, definition: MetricDefinition)

  case class TopKUsersPerAssetMetric(k: Int, lookBackDays: Int) extends MetricDefinition

  case class AssetDistributionBySensitivityTagMetric(k: Int) extends MetricDefinition

  case class QueriesAndSensitivityDistributionMetric(lookBackDays: Int) extends MetricDefinition

  case class SecureAssetAccessUserCountMetric(lookBackDays: Int) extends MetricDefinition

  case object SensitivityDistributionMetric extends MetricDefinition

}
