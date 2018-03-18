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
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, SensitivityDistributionMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results._
import com.hortonworks.dataplane.cs.profiler._
import com.hortonworks.dataplane.http.BaseRoute
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


object SensitivityDistributionProcessor extends MultiMetricProcessor with BaseRoute {

  private case class LivyResponse(non_sensitive_tables: Long, sensitive_tables: Long)


  private implicit val livyResponseFormatter: Format[LivyResponse] = Json.format[LivyResponse]


  def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, userName: String, clusterId: Long, context: ProfilerMetricContext, metricRequests: MetricRequestGroup): Future[MetricResultGroup] = {

    validateMetrics(metricRequests).flatMap(_ =>
      getQuery(context).flatMap(
        postData => {
          val future: Future[WSResponse] = ws.url(profilerConfigs.assetMetricsUrl)
            .withHeaders("Accept" -> "application/json")
            .post(postData)
          future.flatMap(response => response.status match {
            case 202 =>
              val isLeftJoinPrimaryDatasetEmpty = (response.json \ "data").as[List[Map[String, Long]]].head.isEmpty
              val sensitivityDistribution = if (isLeftJoinPrimaryDatasetEmpty) List.empty[LivyResponse] else (response.json \ "data").as[List[LivyResponse]]
              sensitivityDistribution.headOption match {
                case Some(distribution) =>
                  val totalAssets = distribution.non_sensitive_tables + distribution.sensitive_tables
                  Future.successful(List(MetricResult(true, MetricType.SensitivityDistribution, SensitivityDistributionResult(totalAssets, distribution.sensitive_tables))))
                case None =>
                  Future.successful(List(MetricResult(true, MetricType.SensitivityDistribution, SensitivityDistributionResult(0, 0))))
              }

            case _ =>
              Future.successful(List(MetricResult(false, MetricType.SensitivityDistribution,
                MetricErrorDefinition(s"failed to retrieve SensitivityDistributionMetric from profiler agent." +
                  s" status: ${response.status}   , response :${response.json.toString()} "))))
          }
          )
        }
      )
    )
  }


  def getQuery(context: ProfilerMetricContext): Future[AssetMetricRequest] = {
    context.definition match {
      case ClusterContext =>
        Future.successful {
          Json.obj(
            "metrics" -> List(Map("metric" -> "hivesensitivity",
              "aggType" -> "Snapshot"),
              Map("metric" -> "hivemetastorestats",
                "aggType" -> "Snapshot")),
            "sql" ->
              s"""SELECT sum(if(asset_sensitivity_count.sensitivity_table IS NULL, 1, 0)) AS non_sensitive_tables,
                 |       sum(if(asset_sensitivity_count.sensitivity_table IS NULL, 0, 1)) AS sensitive_tables
                 | FROM
                 |  (SELECT a.table AS asset_table,
                 |          b.table AS sensitivity_table
                 |   FROM
                 |     (SELECT table
                 |          FROM   hivemetastorestats_snapshot) a
                 |   LEFT JOIN
                 |     (SELECT distinct(CONCAT(database,'.',table)) AS table
                 |      FROM hivesensitivity_Snapshot ) b ON a.table = b.table) asset_sensitivity_count""".stripMargin.replace("\n", "")
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
              s"""SELECT sum(if(asset_sensitivity_count.sensitivity_table IS NULL, 1, 0)) AS non_sensitive_tables,
                 |       sum(if(asset_sensitivity_count.sensitivity_table IS NULL, 0, 1)) AS sensitive_tables
                 | FROM
                 |  (SELECT a.table AS asset_table,
                 |          b.table AS sensitivity_table
                 |   FROM
                 |     (SELECT distinct(assetid) as table
                 |          FROM   dataset_snapshot WHERE  dataset = '$collectionId') a
                 |   LEFT JOIN
                 |     (SELECT distinct(CONCAT(database,'.',table)) AS table
                 |      FROM hivesensitivity_Snapshot ) b ON a.table = b.table) asset_sensitivity_count""".stripMargin.replace("\n", "")
          )
        }
      case x =>
        Future.failed(new Exception(s"SensitivityDistributionMetric is not available for context $x"))
    }
  }

  private def validateMetrics(metrics: List[ProfilerMetric]): Future[Unit] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case SensitivityDistributionMetric =>
            Future.successful()
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for SensitivityDistributionMetric"))
    }
  }
}



