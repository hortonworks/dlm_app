/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.models

import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.Asset
import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.ProfilerMetricContext
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.ProfilerMetric


object Requests {


  case class ProfilerMetricRequest(clusterId: Long, context: ProfilerMetricContext, metrics: List[ProfilerMetric])

  case class AssetResolvedProfilerMetricRequest(clusterId: Long, assets: List[Asset], metrics: List[ProfilerMetric])

}
