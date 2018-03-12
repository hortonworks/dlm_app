/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.parsers

import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics.MetricType.MetricType
import com.hortonworks.dataplane.commons.domain.profiler.models.Metrics._
import play.api.libs.functional.syntax._
import play.api.libs.json._

object MetricParser {

  private val metricTypeIdentifier = "metricType"

  private val metricDefinitionIdentifier = "definition"

  private implicit val metricTypeFormat: Format[MetricType] = new Format[MetricType] {
    def reads(json: JsValue) = JsSuccess(MetricType.withName(json.as[String]))

    def writes(myEnum: MetricType) = JsString(myEnum.toString)
  }

  private implicit val topKUsersPerAssetMetricFormat: Format[TopKUsersPerAssetMetric] = Json.format[TopKUsersPerAssetMetric]
  private implicit val assetDistributionBySensitivityTagMetricFormat: Format[AssetDistributionBySensitivityTagMetric] =
    Json.format[AssetDistributionBySensitivityTagMetric]
  private implicit val queriesAndSensitivityDistributionMetricFormat: Format[QueriesAndSensitivityDistributionMetric] =
    Json.format[QueriesAndSensitivityDistributionMetric]
  private implicit val secureAssetAccessUserCountMetricFormat: Format[SecureAssetAccessUserCountMetric] =
    Json.format[SecureAssetAccessUserCountMetric]
  private implicit val topKCollectionsMetricFormat: Format[TopKCollectionsMetric] =
    Json.format[TopKCollectionsMetric]
  private implicit val topKAssetsMetricFormat: Format[TopKAssetsMetric] =
    Json.format[TopKAssetsMetric]
  private implicit val assetCountsMetricFormat: Format[AssetCountsMetric] =
    Json.format[AssetCountsMetric]

  private implicit val assetReadEither: Reads[Either[ProfilerMetric, ErrorMessage]] = ((JsPath \ metricTypeIdentifier).read[MetricType]
    and (JsPath \ metricDefinitionIdentifier).read[JsValue]) (
    (metricType, definition) => {
      metricType match {
        case MetricType.TopKUsersPerAsset => Left(ProfilerMetric(MetricType.TopKUsersPerAsset, definition.as[TopKUsersPerAssetMetric]))
        case MetricType.AssetDistributionBySensitivityTag => Left(ProfilerMetric(MetricType.AssetDistributionBySensitivityTag
          , definition.as[AssetDistributionBySensitivityTagMetric]))
        case MetricType.QueriesAndSensitivityDistribution => Left(ProfilerMetric(MetricType.QueriesAndSensitivityDistribution
          , definition.as[QueriesAndSensitivityDistributionMetric]))
        case MetricType.SecureAssetAccessUserCount => Left(ProfilerMetric(MetricType.SecureAssetAccessUserCount
          , definition.as[SecureAssetAccessUserCountMetric]))
        case MetricType.SensitivityDistribution => Left(ProfilerMetric(MetricType.SensitivityDistribution
          , SensitivityDistributionMetric))
        case MetricType.TopKCollections => Left(ProfilerMetric(MetricType.TopKCollections
          , definition.as[TopKCollectionsMetric]))
        case MetricType.TopKAssets => Left(ProfilerMetric(MetricType.TopKAssets
          , definition.as[TopKAssetsMetric]))
        case MetricType.AssetCounts => Left(ProfilerMetric(MetricType.AssetCounts
          , definition.as[AssetCountsMetric]))
        case _ => Right(s"unsupported metric type ${metricType.toString}")
      }
    }
  )

  implicit val metricFormat: Format[ProfilerMetric] = new Format[ProfilerMetric] {

    def reads(json: JsValue) =
      json.as[Either[ProfilerMetric, ErrorMessage]] match {
        case Left(metric) => JsSuccess(metric)
        case Right(error) => JsError(error)
      }

    def writes(metric: ProfilerMetric) = metric.definition match {
      case definition: TopKUsersPerAssetMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> Json.toJson(definition)))
      case definition: AssetDistributionBySensitivityTagMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> Json.toJson(definition)))
      case definition: QueriesAndSensitivityDistributionMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> Json.toJson(definition)))
      case definition: SecureAssetAccessUserCountMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> Json.toJson(definition)))
      case definition: TopKCollectionsMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> Json.toJson(definition)))
      case definition: TopKAssetsMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> Json.toJson(definition)))
      case definition: AssetCountsMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> Json.toJson(definition)))
      case SensitivityDistributionMetric => Json.toJson(Map(metricTypeIdentifier -> JsString(metric.metricType.toString), metricDefinitionIdentifier -> emptyJson))
      case _ => JsNull
    }
  }
}
