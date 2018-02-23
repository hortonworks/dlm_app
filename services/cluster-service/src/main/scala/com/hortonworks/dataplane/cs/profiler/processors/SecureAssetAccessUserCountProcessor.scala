/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.cs.profiler.processors

import java.text.SimpleDateFormat
import java.util.Calendar

import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.{Asset, HiveAssetDefinition}
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.{MetricType, ProfilerMetric, SecureAssetAccessUserCountMetric}
import com.hortonworks.dataplane.commons.domain.profiler.models.Results.{MetricErrorDefinition, MetricResult, SecureAssetAccessUserCountResult, SecureAssetAccessUserCountResultForADay}
import com.hortonworks.dataplane.cs.profiler.{GlobalProfilerConfigs, MetricRequestGroup, MetricResultGroup, MultiMetricProcessor}
import play.api.libs.json.{Format, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object SecureAssetAccessUserCountProcessor extends MultiMetricProcessor {

  val dateFormat = new SimpleDateFormat("yyyy-MM-dd")

  private case class LivyResponse(date: String, count: Long)


  private implicit val livyResponseFormatter: Format[LivyResponse] = Json.format[LivyResponse]

  override def retrieveMetrics(ws: WSClient, profilerConfigs: GlobalProfilerConfigs, userName: String, clusterId: Long, assets: List[Asset], metricRequests: MetricRequestGroup): Future[MetricResultGroup] = {
    validateMetricsAndAssets(metricRequests, assets).flatMap(
      metricAndHiveAssets =>
        if (assets.isEmpty) {
          Future.successful(List(MetricResult(false, MetricType.SecureAssetAccessUserCount, MetricErrorDefinition("Query at lake level is not supported yet"))))
        }
        else {
          val inClause = convertToInClause(metricAndHiveAssets._2)
          val endDay = {
            val cal = Calendar.getInstance
            cal.add(Calendar.DATE, -1)
            dateFormat.format(cal.getTime)
          }


          val startDay = {
            val cal = Calendar.getInstance
            cal.add(Calendar.DATE, -1 * metricAndHiveAssets._1.lookBackDays)
            dateFormat.format(cal.getTime)
          }
          val postData = Json.obj(
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
                 |   WHERE CONCAT(DATABASE,'.',TABLE) IN $inClause
                 |     AND date <= '$endDay'
                 |     AND date >= '$startDay') t1
                 | JOIN
                 |  (SELECT distinct(CONCAT(DATABASE,'.',TABLE)) AS TABLE
                 |   FROM hivesensitivity_Snapshot
                 |   WHERE CONCAT(DATABASE,'.',TABLE) IN $inClause) t2 ON t1.table=t2.table
                 | GROUP BY t1.date
                 | ORDER BY t1.date""".stripMargin.replace("\n", "")
          )
          val future: Future[WSResponse] = ws.url(profilerConfigs.assetMetricsUrl)
            .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
            .post(postData)
          future.flatMap(response => response.status match {
            case 202 =>
              val sensitivityQueryDistribution = (response.json \ "data").as[List[LivyResponse]]
              Future.successful(List(MetricResult(true, MetricType.SecureAssetAccessUserCount,
                SecureAssetAccessUserCountResult(
                  sensitivityQueryDistribution.map(p => SecureAssetAccessUserCountResultForADay(p.date, p.count))))))
            case _ =>
              Future.successful(List(MetricResult(false, MetricType.SecureAssetAccessUserCount,
                MetricErrorDefinition(s"failed to retrieve  SecureAssetAccessUserCount from profiler agent. status: ${response.status}"))))
          })
        }
    )
  }


  private def convertToInClause(hiveAssets: List[HiveAssetDefinition]): String = {
    hiveAssets.map(asset => s"'${asset.database}.${asset.table}'").mkString("(", ",", ")")
  }


  private def validateMetricsAndAssets(metrics: List[ProfilerMetric], assets: List[Asset]): Future[(SecureAssetAccessUserCountMetric, List[HiveAssetDefinition])] = {
    metrics.size match {
      case 1 =>
        metrics.head.definition match {
          case metric: SecureAssetAccessUserCountMetric =>
            Future.sequence(assets.map(
              _.definition match {
                case x: HiveAssetDefinition => Future.successful(x)
                case temp => Future.failed(new Exception(s"Invalid asset $temp"))
              }
            )).map((metric, _))
          case _ => Future.failed(new Exception(s"Invalid metric type ${metrics.head.metricType}"))
        }
      case _ => Future.failed(new Exception("Invalid number of metrics for SecureAssetAccessUserCountProcessor"))
    }
  }
}
