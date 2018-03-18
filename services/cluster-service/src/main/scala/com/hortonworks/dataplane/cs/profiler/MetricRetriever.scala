/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.cs.profiler

import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.ProfilerMetric
import com.hortonworks.dataplane.commons.domain.profiler.models.Requests.ProfilerMetricRequest
import com.hortonworks.dataplane.commons.domain.profiler.models.Responses.ProfilerMetricResults
import com.hortonworks.dataplane.cs.profiler.MultiMetricProcessor.MetricProcessorType.MetricProcessorType
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object MetricRetriever {

  def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, metricRequest: ProfilerMetricRequest, userName: String): Future[ProfilerMetricResults] = {
    val processorTypeToRequestGroup: Map[MetricProcessorType, MetricRequestGroup] = segregateMetricRequestsBasedOnProcessor(metricRequest.metrics)
    val unsupportedMetricsExist = processorTypeToRequestGroup.keys.exists(MultiMetricProcessor.getProcessor(_).isEmpty)
    if (unsupportedMetricsExist)
      Future.failed(new Exception("Unsupported metric Type/s in given request"))
    else {
      val processorToGroup = processorTypeToRequestGroup.map(
        typeAndRequestGroup => MultiMetricProcessor.getProcessor(typeAndRequestGroup._1).get -> typeAndRequestGroup._2
      )
      val eventualMetricResults = processorToGroup.map(
        processorAndGroup =>
          processorAndGroup._1.retrieveMetrics(ws, profilerConfigs, userName, metricRequest.clusterId, metricRequest.context, processorAndGroup._2)
      )
      Future.sequence(eventualMetricResults).map(
        resultGroups => {
          val results = resultGroups.toList.flatten
          val overallStatus = results.forall(_.status)
          ProfilerMetricResults(overallStatus, results)
        }
      )
    }
  }


  private def segregateMetricRequestsBasedOnProcessor(allMetrics: List[ProfilerMetric]): Map[MetricProcessorType, MetricRequestGroup] = {
    allMetrics.foldRight(Map[MetricProcessorType, MetricRequestGroup]()) {
      (metric, segregates) => {
        val processorType = MultiMetricProcessor.processorOf(metric.metricType)
        val updatedMetrics = segregates.getOrElse(processorType, List.empty[ProfilerMetric]) :+ metric
        segregates + (processorType -> updatedMetrics)
      }
    }
  }

}

