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
import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.{ClusterContext, CollectionContext, ProfilerMetricContext}
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, TopKUsersPerAssetMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricErrorDefinition, MetricResult, TopKUsersPerAssetResult}
import com.hortonworks.dataplane.cs.profiler._
import com.hortonworks.dataplane.cs.profiler.processors.helpers.DateValidator
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object TopKUsersPerAssetProcessor extends MultiMetricProcessor {

  private case class LivyResponse(user: String, count: Long)


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
              Future.successful(List(MetricResult(true, MetricType.TopKUsersPerAsset, TopKUsersPerAssetResult(tagsAndCounts.map(p => p.user -> p.count).toMap))))
            case _ =>
              Future.successful(List(MetricResult(false, MetricType.TopKUsersPerAsset, MetricErrorDefinition(s"failed to retrieve  TopKUsersPerAsset from profiler agent" +
                s". status: ${response.status}   , response :${response.json.toString()} "))))
          })
        }
      )
    )
  }


  def getQuery(context: ProfilerMetricContext, metricRequest: TopKUsersPerAssetMetric): Future[AssetMetricRequest] = {

    context.definition match {
      case ClusterContext =>
        Future.successful {
          Json.obj(
            "metrics" -> List(
              Map("metric" -> "hiveagg",
                "aggType" -> "Daily")),
            "sql" ->
              s"""SELECT user,
                 |       sum(COUNT) AS count
                 | FROM
                 |  (SELECT t1.user AS USER,
                 |          explode(t1.aggregates.action) AS (action,
                 |                                            COUNT)
                 |   FROM
                 |     (SELECT CONCAT(DATABASE,'.',TABLE) AS TABLE,
                 |             explode(USER) AS (USER,
                 |                               aggregates)
                 |      FROM hiveagg_Daily
                 |      WHERE  date >= '${metricRequest.startDate}'  and date <= '${metricRequest.endDate}'
                 |      ) t1) t2
                 | GROUP BY USER
                 | ORDER BY COUNT DESC
                 | LIMIT ${metricRequest.k}""".stripMargin.replace("\n", "")
          )
        }
      case CollectionContext(collectionId) =>
        Future.successful {
          Json.obj(
            "metrics" -> List(Map("metric" -> "hiveagg",
              "aggType" -> "Daily"),
              Map("metric" -> "dataset",
                "aggType" -> "Snapshot")),
            "sql" ->
              s"""SELECT   user,
                 |         Sum(count) AS count
                 |  FROM     (
                 |                SELECT t1.USER                       AS USER,
                 |                       Explode(t1.aggregates.action) AS (action, count)
                 |                FROM   (
                 |                              SELECT a1.*
                 |                              FROM   (
                 |                                            SELECT concat(DATABASE,'.',TABLE) AS TABLE,
                 |                                                   explode(USER)              AS (USER, aggregates)
                 |                                            FROM   hiveagg_daily
                 |                                            WHERE  date >= '${metricRequest.startDate}'  and date <= '${metricRequest.endDate}'
                 |                                            ) a1
                 |                              JOIN
                 |                                     (
                 |                                            SELECT assetid AS TABLE
                 |                                            FROM   dataset_snapshot
                 |                                            WHERE  dataset = '$collectionId') a2
                 |                              ON     a1.TABLE=a2.TABLE) t1) t2
                 |  GROUP BY USER
                 |  ORDER BY count DESC limit ${metricRequest.k}""".stripMargin.replace("\n", "")
          )
        }

      case Asset(_, definition) =>
        definition match {
          case hive: HiveAssetDefinition =>
            val tableName = s"${hive.database}.${hive.table}"
            Future.successful {
              Json.obj(
                "metrics" -> List(
                  Map("metric" -> "hiveagg",
                    "aggType" -> "Daily")),
                "sql" ->
                  s"""SELECT user,
                     |       sum(count) AS count
                     | FROM
                     |  (SELECT t1.user AS USER,
                     |          explode(t1.aggregates.action) AS (action,
                     |                                            count)
                     |   FROM
                     |     (SELECT CONCAT(DATABASE,'.',TABLE) AS table,
                     |             explode(USER) AS (user,
                     |                               aggregates)
                     |      FROM hiveagg_Daily where CONCAT(DATABASE,'.',TABLE)='$tableName'
                     |      and date >= '${metricRequest.startDate}'  and date <= '${metricRequest.endDate}'
                     |      ) t1) t2
                     | GROUP BY user
                     | ORDER BY count DESC
                     | LIMIT ${metricRequest.k}""".stripMargin.replace("\n", "")
              )
            }
          case x =>
            Future.failed(new Exception(s"TopKUsersPerAssetMetric is not available for asset $x"))
        }
      case x =>
        Future.failed(new Exception(s"TopKUsersPerAssetMetric is not available for context $x"))
    }
  }

  private def validateMetrics(metrics: List[ProfilerMetric]): Future[TopKUsersPerAssetMetric] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: TopKUsersPerAssetMetric =>
            DateValidator.validateDate(metric.startDate).flatMap(
              _ => DateValidator.validateDate(metric.endDate)
            ).map(_ => metric)
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for TopKUsersPerAssetProcessor"))
    }
  }
}
