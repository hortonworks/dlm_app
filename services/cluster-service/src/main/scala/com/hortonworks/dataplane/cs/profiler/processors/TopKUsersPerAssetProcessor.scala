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
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, TopKUsersPerAssetMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricErrorDefinition, MetricResult, TopKUsersPerAssetResult}
import com.hortonworks.dataplane.cs.profiler.{GlobalProfilerConfigs, MetricRequestGroup, MetricResultGroup, MultiMetricProcessor}
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object TopKUsersPerAssetProcessor extends MultiMetricProcessor {

  private case class LivyResponse(user: String, count: Long)


  private implicit val livyResponseFormatter: Format[LivyResponse] = Json.format[LivyResponse]


  override def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, userName: String, clusterId: Long, assets: List[Asset], metricRequests: MetricRequestGroup): Future[MetricResultGroup] = {

    validateMetricsAndAssets(metricRequests, assets).flatMap(metricAndHiveAssets => {
      if (assets.isEmpty) {
        Future.successful(List(MetricResult(false, MetricType.TopKUsersPerAsset, MetricErrorDefinition("Query at lake level is not supported yet"))))
      }
      else {
        val inClause = convertToInClause(metricAndHiveAssets._2)
        val postData = Json.obj(
          "metrics" -> List(Map("metric" -> "hiveagg",
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
               |      WHERE CONCAT(DATABASE,'.',TABLE) IN $inClause) t1) t2
               | GROUP BY USER
               | ORDER BY COUNT DESC
               | LIMIT ${metricAndHiveAssets._1.k}""".stripMargin.replace("\n", "")
        )
        val future: Future[WSResponse] = ws.url(profilerConfigs.assetMetricsUrl)
          .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
          .post(postData)
        future.flatMap(response => response.status match {
          case 202 =>
            val tagsAndCounts = (response.json \ "data").as[List[LivyResponse]]
            Future.successful(List(MetricResult(true, MetricType.TopKUsersPerAsset, TopKUsersPerAssetResult(tagsAndCounts.map(p => p.user -> p.count).toMap))))
          case _ =>
            Future.successful(List(MetricResult(false, MetricType.TopKUsersPerAsset, MetricErrorDefinition(s"failed to retrieve  TopKUsersPerAsset from profiler agent. status: ${response.status}"))))
        })
      }
    })
  }


  private def convertToInClause(hiveAssets: List[HiveAssetDefinition]): String = {
    hiveAssets.map(asset => s"'${asset.database}.${asset.table}'").mkString("(", ",", ")")
  }

  private def validateMetricsAndAssets(metrics: List[ProfilerMetric], assets: List[Asset]): Future[(TopKUsersPerAssetMetric, List[HiveAssetDefinition])] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: TopKUsersPerAssetMetric =>
            Future.sequence(assets.map(
              _.definition match {
                case x: HiveAssetDefinition => Future.successful(x)
                case temp => Future.failed(new Exception(s"Invalid asset $temp"))
              }
            )).map((metric, _))
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for TopKUsersPerAssetMetric"))
    }
  }
}
