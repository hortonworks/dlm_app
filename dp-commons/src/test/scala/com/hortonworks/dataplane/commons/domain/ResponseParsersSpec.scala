/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */


package com.hortonworks.dataplane.commons.domain

import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.MetricType
import com.hortonworks.dataplane.commons.domain.profiler.models.Responses.ProfilerMetricResults
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricResult, MetricErrorDefinition, TopKUsersPerAssetResult}
import org.scalatest.AsyncFlatSpec
import play.api.libs.json.{JsValue, Json}
import com.hortonworks.dataplane.commons.domain.profiler.parsers.ResponseParser._

class ResponseParsersSpec extends AsyncFlatSpec {

  "ResponseParser" should " parse AssetResolvedProfilerMetricRequest  to json and back" in {


    val metrics = List(MetricResult(true, MetricType.TopKUsersPerAsset, TopKUsersPerAssetResult(Map("test" -> 100l))))
    val simpleRequest = ProfilerMetricResults(true, metrics)

    val simpleRequestJson: JsValue = Json.toJson(simpleRequest)


    assert(simpleRequestJson.as[ProfilerMetricResults] == simpleRequest)

    val metrics2 = List(MetricResult(false, MetricType.TopKUsersPerAsset, MetricErrorDefinition("error")))

    val simpleRequest2 = ProfilerMetricResults(true, metrics2)

    val simpleRequestJson2: JsValue = Json.toJson(simpleRequest2)

    assert(simpleRequestJson2.as[ProfilerMetricResults] == simpleRequest2)
  }


}
