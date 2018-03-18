/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.cs.profiler.processors

import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.{ClusterContext, ProfilerMetricContext}
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, TopKCollectionsMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricErrorDefinition, MetricResult, TopKCollectionsResult}
import com.hortonworks.dataplane.cs.profiler._
import com.hortonworks.dataplane.cs.profiler.processors.helpers.DateValidator
import play.api.libs.json.{Format, JsValue, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object TopKCollectionsProcessor extends MultiMetricProcessor {

  private case class LivyResponse(collection: String, count: Long)


  private implicit val livyResponseFormatter: Format[LivyResponse] = Json.format[LivyResponse]

  def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, userName: String, clusterId: Long, context: ProfilerMetricContext, metricRequests: MetricRequestGroup): Future[MetricResultGroup] = {

    validateMetrics(metricRequests).flatMap(metric =>
      getQuery(context, metric).flatMap(
        postData => {
          val future: Future[WSResponse] = ws.url(profilerConfigs.assetMetricsUrl)
            .withHeaders("Accept" -> "application/json")
            .post(postData)
          future.flatMap(response => response.status match {
            case 202 =>
              val tagsAndCounts = (response.json \ "data").as[List[LivyResponse]]
              Future.successful(List(MetricResult(true, MetricType.TopKCollections, TopKCollectionsResult(tagsAndCounts.map(p => p.collection -> p.count).toMap))))
            case _ =>
              Future.successful(List(MetricResult(false, MetricType.TopKCollections, MetricErrorDefinition(s"failed to retrieve  TopKCollections from profiler agent" +
                s". status: ${response.status}   , response :${response.json.toString()} "))))
          })
        }
      )
    )
  }


  def getQuery(context: ProfilerMetricContext, metricRequest: TopKCollectionsMetric): Future[AssetMetricRequest] = {

    context.definition match {
      case ClusterContext =>
        Future.successful {
          Json.obj(
            "metrics" -> List(
              Map("metric" -> "hiveagg",
                "aggType" -> "Daily"),
              Map("metric" -> "dataset",
                "aggType" -> "Snapshot")),
            "sql" ->
              s"""SELECT a2.collection as collection,
                 |       Sum(a1.count) AS count
                 |  FROM   (SELECT Concat(DATABASE, '.', table) AS table,
                 |               count
                 |        FROM   hiveagg_daily
                 |        WHERE  date >= '${metricRequest.startDate}'  and date <= '${metricRequest.endDate}'
                 |        ) a1
                 |       JOIN (SELECT dataset AS collection,
                 |                    assetid AS table
                 |             FROM   dataset_snapshot) a2
                 |         ON a1.table = a2.table
                 |  GROUP  BY a2.collection
                 |  ORDER  BY count DESC
                 |  LIMIT  ${metricRequest.k}""".stripMargin.replace("\n", "")
          )
        }
      case x =>
        Future.failed(new Exception(s"TopKCollectionsMetric is not available for context $x"))
    }
  }

  private def validateMetrics(metrics: List[ProfilerMetric]): Future[TopKCollectionsMetric] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: TopKCollectionsMetric =>
            DateValidator.validateDate(metric.startDate).flatMap(
              _ => DateValidator.validateDate(metric.endDate)
            ).map(_ => metric)
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for TopKCollectionsProcessor"))
    }
  }
}
