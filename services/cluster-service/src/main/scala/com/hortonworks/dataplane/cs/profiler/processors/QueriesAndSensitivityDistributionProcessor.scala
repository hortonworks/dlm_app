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
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, QueriesAndSensitivityDistributionMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricErrorDefinition, MetricResult, QueriesAndSensitivityDistributionResult}
import com.hortonworks.dataplane.cs.profiler._
import com.hortonworks.dataplane.cs.profiler.processors.helpers.DateValidator
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object QueriesAndSensitivityDistributionProcessor extends MultiMetricProcessor {

  private case class LivyResponse(non_sensitive_queries: Long, sensitive_queries: Long)

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
              val isLeftJoinPrimaryDatasetEmpty = (response.json \ "data").as[List[Map[String, Long]]].head.isEmpty
              val queryDistribution = if (isLeftJoinPrimaryDatasetEmpty) List.empty[LivyResponse] else (response.json \ "data").as[List[LivyResponse]]
              queryDistribution.headOption match {
                case Some(distribution) =>
                  val totalQueries = distribution.non_sensitive_queries + distribution.sensitive_queries
                  Future.successful(List(MetricResult(true, MetricType.QueriesAndSensitivityDistribution, QueriesAndSensitivityDistributionResult(totalQueries, distribution.sensitive_queries))))
                case None =>
                  Future.successful(List(MetricResult(true, MetricType.QueriesAndSensitivityDistribution, QueriesAndSensitivityDistributionResult(0, 0))))
              }
            case _ =>
              Future.successful(List(MetricResult(false, MetricType.QueriesAndSensitivityDistribution, MetricErrorDefinition(s"failed to retrieve  QueriesAndSensitivityDistribution from profiler agent" +
                s". status: ${response.status}   , response :${response.json.toString()} "))))
          })
        }
      )
    )
  }


  def getQuery(context: ProfilerMetricContext, metricRequest: QueriesAndSensitivityDistributionMetric): Future[AssetMetricRequest] = {
    context.definition match {
      case ClusterContext =>
        Future.successful {
          Json.obj(
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
                 |         FROM hiveagg_Daily where
                 |         date >= '${metricRequest.startDate}'  and date <= '${metricRequest.endDate}' ) t
                 |      GROUP BY t.table) a
                 |   LEFT JOIN
                 |     (SELECT distinct(CONCAT(database,'.',table)) AS table
                 |      FROM hivesensitivity_Snapshot) b ON a.table = b.table) audit_sensitivity_count""".stripMargin.replace("\n", "")
          )
        }
      case CollectionContext(collectionId) =>
        Future.successful {
          Json.obj(
            "metrics" -> List(Map("metric" -> "hivesensitivity",
              "aggType" -> "Snapshot"),
              Map("metric" -> "hiveagg",
                "aggType" -> "Daily"),
              Map("metric" -> "dataset",
                "aggType" -> "Snapshot")),
            "sql" ->
              s"""  SELECT SUM(IF(audit_sensitivity_count.sensitivity_table IS NULL,
                 |                      audit_sensitivity_count.count, 0)) AS
                 |       non_sensitive_queries,
                 |       SUM(IF(audit_sensitivity_count.sensitivity_table IS NULL, 0,
                 |               audit_sensitivity_count.count))           AS sensitive_queries
                 |  FROM   (SELECT a.table AS audit_table,
                 |               b.table AS sensitivity_table,
                 |               a.count AS count
                 |        FROM   (SELECT table,
                 |                       SUM(count) count
                 |                FROM   (SELECT Concat(DATABASE, '.', table) AS table,
                 |                               count
                 |                        FROM   hiveagg_daily where
                 |                        date >= '${metricRequest.startDate}'  and date <= '${metricRequest.endDate}') t1
                 |                       join (SELECT assetid
                 |                             FROM   dataset_snapshot
                 |                             WHERE  dataset = '$collectionId') t2
                 |                         ON t2.assetid = t1.table
                 |                GROUP  BY table) a
                 |               left join (SELECT DISTINCT( table ) AS table
                 |                          FROM   (SELECT DISTINCT( Concat(DATABASE, '.', table)
                 |                                                 ) AS
                 |                                                 table
                 |                                  FROM   hivesensitivity_snapshot) t1
                 |                                 join (SELECT assetid
                 |                                       FROM   dataset_snapshot
                 |                                       WHERE  dataset = '$collectionId') t2
                 |                                   ON t2.assetid = t1.table) b
                 |                      ON a.table = b.table) audit_sensitivity_count
                 |                      """.stripMargin.replace("\n", "")
          )
        }

      case x =>
        Future.failed(new Exception(s"QueriesAndSensitivityDistributionMetric is not available for context $x"))
    }
  }

  private def validateMetrics(metrics: List[ProfilerMetric]): Future[QueriesAndSensitivityDistributionMetric] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: QueriesAndSensitivityDistributionMetric =>
            DateValidator.validateDate(metric.startDate).flatMap(
              _ => DateValidator.validateDate(metric.endDate)
            ).map(_ => metric)
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for QueriesAndSensitivityDistributionMetricProcessor"))
    }
  }

}
