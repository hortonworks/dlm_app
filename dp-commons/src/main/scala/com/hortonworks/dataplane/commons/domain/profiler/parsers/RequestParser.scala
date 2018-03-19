/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.parsers


import play.api.libs.json._
import MetricParser._
import ProfilerMetricContextParser._
import com.hortonworks.dataplane.commons.domain.profiler.models.Requests.ProfilerMetricRequest

object RequestParser {


  implicit val profilerMetricRequestFormat: Format[ProfilerMetricRequest] = Json.format[ProfilerMetricRequest]

}
