/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.cs.profiler.processors

import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.{Asset, HiveAssetDefinition}
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, QueriesAndSensitivityDistributionMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricErrorDefinition, MetricResult, QueriesAndSensitivityDistributionResult}
import com.hortonworks.dataplane.cs.profiler.{GlobalProfilerConfigs, MetricRequestGroup, MetricResultGroup, MultiMetricProcessor}
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object QueriesAndSensitivityDistributionProcessor extends MultiMetricProcessor {

  private case class LivyResponse(non_sensitive_queries: Long, sensitive_queries: Long)


  private implicit val livyResponseFormatter: Format[LivyResponse] = Json.format[LivyResponse]

  override def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, userName: String, clusterId: Long, assets: List[Asset], metricRequests: MetricRequestGroup): Future[MetricResultGroup] = {
    validateMetricsAndAssets(metricRequests, assets).flatMap(
      metricAndHiveAssets =>
        if (assets.isEmpty) {
          Future.successful(List(MetricResult(false, MetricType.QueriesAndSensitivityDistribution, MetricErrorDefinition("Query at lake level is not supported yet"))))
        }
        else {
          val inClause = convertToInClause(metricAndHiveAssets._2)
          val postData = Json.obj(
            "metrics" -> List(Map("metric" -> "hivesensitivity",
              "aggType" -> "Snapshot"),
              Map("metric" -> "hiveagg",
                "aggType" -> "Daily")),
            "sql" ->
              s"""SELECT sum(if(audit_sensitivity_count.sensitivity_table IS NULL, audit_sensitivity_count.count, 0)) AS non_sensitive_queries,
                 |       sum(if(audit_sensitivity_count.sensitivity_table IS NULL, 0, audit_sensitivity_count.count)) AS sensitive_queries
                 | FROM
                 |  (SELECT a.table AS audit_table,
                 |          b.table AS sensitivity_table,
                 |          a.count AS count
                 |   FROM
                 |     (SELECT t.table AS table,
                 |             sum(t.count) AS count
                 |      FROM
                 |        (SELECT CONCAT(database,'.',table) AS table,
                 |                COUNT
                 |         FROM hiveagg_Daily where CONCAT(database,'.',table) in $inClause) t
                 |      GROUP BY t.table) a
                 |   LEFT JOIN
                 |     (SELECT distinct(CONCAT(database,'.',table)) AS table
                 |      FROM hivesensitivity_Snapshot where CONCAT(database,'.',table) in $inClause) b ON a.table = b.table) audit_sensitivity_count""".stripMargin.replace("\n", "")
          )
          val future: Future[WSResponse] = ws.url(profilerConfigs.assetMetricsUrl)
            .withHeaders("Accept" -> "application/json")
            .post(postData)
          future.flatMap(response => response.status match {
            case 202 =>
              val queryDistribution = (response.json \ "data").as[List[LivyResponse]]
              val totalQueries = queryDistribution.head.non_sensitive_queries + queryDistribution.head.sensitive_queries
              Future.successful(List(MetricResult(true, MetricType.QueriesAndSensitivityDistribution, QueriesAndSensitivityDistributionResult(totalQueries, queryDistribution.head.sensitive_queries))))
            case _ =>
              Future.successful(List(MetricResult(false, MetricType.QueriesAndSensitivityDistribution, MetricErrorDefinition(s"failed to retrieve  QueriesAndSensitivityDistribution from profiler agent. status: ${response.status}"))))
          })
        }
    )
  }


  private def convertToInClause(hiveAssets: List[HiveAssetDefinition]): String = {
    hiveAssets.map(asset => s"'${asset.database}.${asset.table}'").mkString("(", ",", ")")
  }


  private def validateMetricsAndAssets(metrics: List[ProfilerMetric], assets: List[Asset]): Future[(QueriesAndSensitivityDistributionMetric, List[HiveAssetDefinition])] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: QueriesAndSensitivityDistributionMetric =>
            Future.sequence(assets.map(
              _.definition match {
                case x: HiveAssetDefinition => Future.successful(x)
                case temp => Future.failed(new Exception(s"Invalid asset $temp"))
              }
            )).map((metric, _))
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for QueriesAndSensitivityDistributionProcessor"))
    }
  }
}
