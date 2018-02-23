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
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, SensitivityDistributionMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricErrorDefinition, MetricResult, SensitivityDistributionResult}
import com.hortonworks.dataplane.cs.profiler.{GlobalProfilerConfigs, MetricRequestGroup, MetricResultGroup, MultiMetricProcessor}
import com.hortonworks.dataplane.http.BaseRoute
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


object SensitivityDistributionProcessor extends MultiMetricProcessor with BaseRoute {

  private case class LivyResponse(count: Long)


  private implicit val livyResponseFormatter: Format[LivyResponse] = Json.format[LivyResponse]

  override def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, userName: String, clusterId: Long, assets: List[Asset], metricRequests: MetricRequestGroup): Future[MetricResultGroup] = {

    validateMetricsAndAssets(metricRequests, assets).flatMap(hiveAssets => {
      if (assets.isEmpty) {
        Future.successful(List(MetricResult(false, MetricType.SensitivityDistribution, MetricErrorDefinition("Query at lake level is not supported yet"))))
      }
      else {
        val inClause = convertToInClause(hiveAssets)
        val postData = Json.obj(
          "metrics" -> List(Map("metric" -> "hivesensitivity",
            "aggType" -> "Snapshot")),
          "sql" ->
            s"""select count(distinct(CONCAT(database,'.',table))) as count
               |  from hivesensitivity_Snapshot
               |    where CONCAT(database,'.',table) in  $inClause""".stripMargin.replace("\n", "")
        )
        val future: Future[WSResponse] = ws.url(profilerConfigs.assetMetricsUrl)
          .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
          .post(postData)
        future.flatMap(response => response.status match {
          case 202 =>
            val numberOfSensitiveTables = (response.json \ "data").as[List[LivyResponse]].head.count
            Future.successful(List(MetricResult(true, MetricType.SensitivityDistribution, SensitivityDistributionResult(assets.size, numberOfSensitiveTables))))
          case _ =>
            Future.successful(List(MetricResult(false, MetricType.SensitivityDistribution, MetricErrorDefinition(s"failed to retrieve SensitivityDistributionMetric from profiler agent. status: ${response.status}"))))
        }
        )
      }
    })
  }


  private def convertToInClause(hiveAssets: List[HiveAssetDefinition]): String = {
    hiveAssets.map(asset => s"'${asset.database}.${asset.table}'").mkString("(", ",", ")")
  }


  private def validateMetricsAndAssets(metrics: List[ProfilerMetric], assets: List[Asset]): Future[List[HiveAssetDefinition]] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case SensitivityDistributionMetric =>
            Future.sequence(assets.map(
              _.definition match {
                case x: HiveAssetDefinition => Future.successful(x)
                case temp => Future.failed(new Exception(s"Invalid asset $temp"))
              }
            ))
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for TopKUsersPerAssetProcessor"))
    }
  }
}



