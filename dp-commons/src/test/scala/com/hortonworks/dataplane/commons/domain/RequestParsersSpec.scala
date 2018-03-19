/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */


package com.hortonworks.dataplane.commons.domain

import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.{ClusterContext, MetricContextType, ProfilerMetricContext}
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, SensitivityDistributionMetric, TopKUsersPerAssetMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Requests.ProfilerMetricRequest
import com.hortonworks.dataplane.commons.domain.profiler.parsers.RequestParser._
import org.scalatest.AsyncFlatSpec
import play.api.libs.json.{JsValue, Json}

class RequestParsersSpec extends AsyncFlatSpec {


  "RequestParser" should "Parse ProfilerMetricRequest  to json and back" in {
    val metrics = List(ProfilerMetric(MetricType.TopKUsersPerAsset, TopKUsersPerAssetMetric(10, "a", "b")), ProfilerMetric(MetricType.SensitivityDistribution, SensitivityDistributionMetric))

    val profilerMetricRequest = ProfilerMetricRequest(1l, ProfilerMetricContext(MetricContextType.CLUSTER, ClusterContext), metrics)

    val profilerMetricRequestJson: JsValue = Json.toJson(profilerMetricRequest)

    assert(profilerMetricRequestJson.as[ProfilerMetricRequest] == profilerMetricRequest)

  }

}
