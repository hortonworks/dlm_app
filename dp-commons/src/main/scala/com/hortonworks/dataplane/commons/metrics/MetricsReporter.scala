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

package com.hortonworks.dataplane.commons.metrics

import java.io.StringWriter

import com.codahale.metrics._
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import io.prometheus.client.CollectorRegistry
import io.prometheus.client.exporter.common.TextFormat
import play.api.libs.json.{JsValue, Json}

import scala.collection.JavaConverters._

object MetricsReporter {

  val mapper = new ObjectMapper with ScalaObjectMapper
  mapper.registerModule(DefaultScalaModule)

  val prometheusNameParam = "name[]"
  val prometheus = "prometheus"
  val exportParam = "exporter"

  def asJson(implicit mr: MetricsRegistry): JsValue = {
    val counters = mr.registry.getCounters.asScala
    val meters = mr.registry.getMeters.asScala
    val gauges = mr.registry.getGauges.asScala
    val timers = mr.registry.getTimers.asScala

    val map = scala.collection.mutable.LinkedHashMap[String, Any]()

    counters.foreach {
      case (k: String, v: Counter) =>
        map.put(k, v.getCount())
    }

    timers.foreach {
      case (k: String, v: Timer) =>
        map.put(k,
          Map("count" -> v.getCount,
            "meanRate" -> v.getMeanRate,
            "max" -> v.getSnapshot.getMax,
            "min" -> v.getSnapshot.getMin,
            "mean" -> v.getSnapshot.getMean))
    }

    meters.foreach {
      case (k: String, v: Meter) =>
        map.put(k, Map("count" -> v.getCount, "meanRate" -> v.getMeanRate))
    }

    gauges.foreach {
      case (k: String, v: Gauge[_]) =>
        map.put(k, v.getValue)
    }

    Json.parse(mapper.writeValueAsBytes(map.toMap))

  }


  def asPrometheusTextExport(params:java.util.Set[String])(implicit mr: MetricsRegistry):String = {
    val writer = new StringWriter()
    TextFormat.write004(writer, CollectorRegistry.defaultRegistry.filteredMetricFamilySamples(params))
    writer.toString
  }


}
