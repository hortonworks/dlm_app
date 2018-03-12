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

object Results {

  trait ResultDefinition

  case class MetricResult(status: Boolean, metricType: MetricType, definition: ResultDefinition)

  case class TopKUsersPerAssetResult(accessCounts: Map[String, Long]) extends ResultDefinition

  case class AssetDistributionBySensitivityTagResult(tagToAssetCount: Map[String, Long]) extends ResultDefinition

  case class QueriesAndSensitivityDistributionResult(totalQueries: Long, queriesRunningOnSensitiveData: Long) extends ResultDefinition

  case class SecureAssetAccessUserCountResultForADay(date: String, numberOfAccesses: Long) extends ResultDefinition

  case class SecureAssetAccessUserCountResult(accessPerDay: List[SecureAssetAccessUserCountResultForADay]) extends ResultDefinition

  case class SensitivityDistributionResult(totalAssets: Long, assetsHavingSensitiveData: Long) extends ResultDefinition

  case class MetricErrorDefinition(errorMessage: String) extends ResultDefinition

}
