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
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, SecureAssetAccessUserCountMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results._
import com.hortonworks.dataplane.cs.profiler._
import com.hortonworks.dataplane.cs.profiler.processors.helpers.DateValidator
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object SecureAssetAccessUserCountProcessor extends MultiMetricProcessor {


  private case class LivyResponse(date: String, count: Long)


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
              val sensitivityQueryDistribution =   (response.json \ "data").as[List[LivyResponse]]
              Future.successful(List(MetricResult(true, MetricType.SecureAssetAccessUserCount,
                SecureAssetAccessUserCountResult(
                  sensitivityQueryDistribution.map(p => SecureAssetAccessUserCountResultForADay(p.date, p.count))))))
            case _ =>
              Future.successful(List(MetricResult(false, MetricType.SecureAssetAccessUserCount,
                MetricErrorDefinition(s"failed to retrieve  SecureAssetAccessUserCount from profiler agent." +
                  s" status: ${response.status}   , response :${response.json.toString()} "))))
          })
        }
      )
    )
  }

  def getQuery(context: ProfilerMetricContext, metricRequest: SecureAssetAccessUserCountMetric): Future[AssetMetricRequest] = {
    context.definition match {
      case ClusterContext =>
        Future.successful {
          Json.obj(
            "metrics" -> List(Map("metric" -> "hivesensitivity",
              "aggType" -> "Snapshot"),
              Map("metric" -> "hiveagg",
                "aggType" -> "Daily")),
            "sql" ->
              s"""SELECT t1.date AS date,
                 |       sum(t1.count) AS count
                 | FROM
                 |  (SELECT CONCAT(DATABASE,'.',TABLE) AS TABLE,
                 |          COUNT,date
                 |   FROM hiveagg_Daily
                 |   WHERE  date <= '${metricRequest.endDate}'
                 |     AND date >= '${metricRequest.startDate}') t1
                 | JOIN
                 |  (SELECT distinct(CONCAT(DATABASE,'.',TABLE)) AS TABLE
                 |   FROM hivesensitivity_Snapshot ) t2 ON t1.table=t2.table
                 | GROUP BY t1.date
                 | ORDER BY t1.date""".stripMargin.replace("\n", "")
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
              s"""SELECT t1.date       AS date,
                 |       Sum(t1.count) AS count
                 |  FROM   (SELECT a1.*
                 |        FROM   (SELECT Concat(database, '.', table) AS table,
                 |                       count,
                 |                       date
                 |                FROM   hiveagg_daily
                 |                WHERE  date <= '${metricRequest.endDate}'
                 |                       AND date >= '${metricRequest.startDate}') a1
                 |               JOIN (SELECT assetid AS table
                 |                     FROM   dataset_snapshot
                 |                     WHERE  dataset = '$collectionId') a2
                 |                 ON a1.table = a2.table) t1
                 |       JOIN (SELECT DISTINCT( a1.table ) AS table
                 |             FROM   (SELECT DISTINCT( Concat(database, '.', table) ) AS TABLE
                 |                     FROM   hivesensitivity_snapshot) a1
                 |                    JOIN (SELECT assetid AS table
                 |                          FROM   dataset_snapshot
                 |                          WHERE  dataset = '$collectionId') a2
                 |                      ON a1.table = a2.table) t2
                 |         ON t1.table = t2.table
                 |  GROUP  BY t1.date
                 |  ORDER  BY t1.date""".stripMargin.replace("\n", "")
          )
        }
      case x =>
        Future.failed(new Exception(s"SecureAssetAccessUserCountMetric is not available for context $x"))
    }
  }

  private def validateMetrics(metrics: List[ProfilerMetric]): Future[SecureAssetAccessUserCountMetric] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: SecureAssetAccessUserCountMetric =>
            DateValidator.validateDate(metric.startDate).flatMap(
              _ => DateValidator.validateDate(metric.endDate)
            ).map(_ => metric)
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for SecureAssetAccessUserCountMetricProcessor"))
    }
  }
}
