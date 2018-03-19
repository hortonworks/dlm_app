/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.cs.profiler.processors

import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.{ClusterContext, CollectionContext, ProfilerMetricContext}
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{AssetDistributionBySensitivityTagMetric, MetricType, ProfilerMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{AssetDistributionBySensitivityTagResult, MetricErrorDefinition, MetricResult}
import com.hortonworks.dataplane.cs.profiler._
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object AssetDistributionBySensitivityTagProcessor extends MultiMetricProcessor {

  private case class LivyResponse(tag: String, count: Long)


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
              val tagsAndCounts =  (response.json \ "data").as[List[LivyResponse]]
              Future.successful(List(MetricResult(true, MetricType.AssetDistributionBySensitivityTag, AssetDistributionBySensitivityTagResult(tagsAndCounts.map(p => p.tag -> p.count).toMap))))
            case _ =>
              Future.successful(List(MetricResult(false, MetricType.AssetDistributionBySensitivityTag, MetricErrorDefinition(s"failed to retrieve  AssetDistributionBySensitivityTag from profiler agent. " +
                s"status: ${response.status}  , response :${response.json.toString()} "))))
          })
        }
      )
    )
  }

  def getQuery(context: ProfilerMetricContext, metricRequest: AssetDistributionBySensitivityTagMetric): Future[AssetMetricRequest] = {
    context.definition match {
      case ClusterContext =>
        Future.successful {
          Json.obj(
            "metrics" -> List(Map("metric" -> "hivesensitivity",
              "aggType" -> "Snapshot")),
            "sql" ->
              s"""select label as tag,count(distinct(CONCAT(database,'.',table))) as count
                 |  from hivesensitivity_Snapshot
                 |  group by tag order by count DESC limit ${metricRequest.k}""".stripMargin.replace("\n", "")
          )
        }
      case CollectionContext(collectionId) =>
        Future.successful {
          Json.obj(
            "metrics" -> List(Map("metric" -> "hivesensitivity",
              "aggType" -> "Snapshot"),
              Map("metric" -> "dataset",
                "aggType" -> "Snapshot")),
            "sql" ->
              s""" select t1.tag as tag,count(distinct(t1.table)) as count
                 |  FROM
                 |  (select label as tag,CONCAT(database,'.',table) as table
                 |  from hivesensitivity_Snapshot) t1
                 |  JOIN
                 |  (select assetid from dataset_Snapshot where dataset='$collectionId') t2
                 |  ON t1.table=t2.assetid
                 |  group by tag order by count DESC limit ${metricRequest.k}""".stripMargin.replaceAll("\n", " ")
          )
        }

      case x =>
        Future.failed(new Exception(s"AssetDistributionBySensitivityTagMetric is not defined for context $x"))
    }
  }

  private def validateMetrics(metrics: List[ProfilerMetric]): Future[AssetDistributionBySensitivityTagMetric] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: AssetDistributionBySensitivityTagMetric =>
            Future.successful(metric)
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for AssetDistributionBySensitivityTagProcessor"))
    }
  }
}
