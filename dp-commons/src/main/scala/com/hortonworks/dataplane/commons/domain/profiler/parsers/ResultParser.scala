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
import com.hortonworks.dataplane.commons.domain.profiler.models.Results._
import play.api.libs.functional.syntax._
import play.api.libs.json._

object ResultParser {

  private val metricTypeIdentifier = "metricType"

  private val resultDefinitionIdentifier = "definition"

  private val resultStatusIdentifier = "status"

  private implicit val metricTypeFormat: Format[MetricType] = new Format[MetricType] {
    def reads(json: JsValue) = JsSuccess(MetricType.withName(json.as[String]))

    def writes(myEnum: MetricType) = JsString(myEnum.toString)
  }
  private implicit val topKUsersPerAssetMetricFormat: Format[TopKUsersPerAssetResult] = Json.format[TopKUsersPerAssetResult]
  private implicit val assetDistributionBySensitivityTagResultFormat: Format[AssetDistributionBySensitivityTagResult] =
    Json.format[AssetDistributionBySensitivityTagResult]
  private implicit val queriesAndSensitivityDistributionResultFormat: Format[QueriesAndSensitivityDistributionResult] =
    Json.format[QueriesAndSensitivityDistributionResult]
  private implicit val secureAssetAccessUserCountResultForADayFormat: Format[SecureAssetAccessUserCountResultForADay] =
    Json.format[SecureAssetAccessUserCountResultForADay]
  private implicit val secureAssetAccessUserCountResultFormat: Format[SecureAssetAccessUserCountResult] =
    Json.format[SecureAssetAccessUserCountResult]
  private implicit val sensitivityDistributionResultFormat: Format[SensitivityDistributionResult] =
    Json.format[SensitivityDistributionResult]
  private implicit val topKCollectionsResultFormat: Format[TopKCollectionsResult] =
    Json.format[TopKCollectionsResult]
  private implicit val topKAssetsResultFormat: Format[TopKAssetsResult] =
    Json.format[TopKAssetsResult]
  private implicit val assetCountsResultForADayFormat: Format[AssetCountsResultForADay] =
    Json.format[AssetCountsResultForADay]
  private implicit val assetCountsResultFormat: Format[AssetCountsResult] =
    Json.format[AssetCountsResult]
  private implicit val metricErrorDefinitionFormat: Format[MetricErrorDefinition] =
    Json.format[MetricErrorDefinition]

  private implicit val assetReadEither: Reads[Either[MetricResult, ErrorMessage]] = (
    (JsPath \ resultStatusIdentifier).read[Boolean] and
      (JsPath \ metricTypeIdentifier).read[MetricType]
      and (JsPath \ resultDefinitionIdentifier).read[JsValue]) (
    (status, metricType, definition) => {
      if (status) {
        metricType match {
          case MetricType.TopKUsersPerAsset => Left(MetricResult(status, MetricType.TopKUsersPerAsset, definition.as[TopKUsersPerAssetResult]))
          case MetricType.AssetDistributionBySensitivityTag => Left(MetricResult(status, MetricType.AssetDistributionBySensitivityTag
            , definition.as[AssetDistributionBySensitivityTagResult]))
          case MetricType.QueriesAndSensitivityDistribution => Left(MetricResult(status, MetricType.QueriesAndSensitivityDistribution
            , definition.as[QueriesAndSensitivityDistributionResult]))
          case MetricType.SecureAssetAccessUserCount => Left(MetricResult(status, MetricType.SecureAssetAccessUserCount
            , definition.as[SecureAssetAccessUserCountResult]))
          case MetricType.SensitivityDistribution => Left(MetricResult(status, MetricType.SensitivityDistribution
            , definition.as[SensitivityDistributionResult]))
          case MetricType.TopKCollections => Left(MetricResult(status, MetricType.TopKCollections
            , definition.as[TopKCollectionsResult]))
          case MetricType.TopKAssets => Left(MetricResult(status, MetricType.TopKAssets
            , definition.as[TopKAssetsResult]))
          case MetricType.AssetCounts => Left(MetricResult(status, MetricType.AssetCounts
            , definition.as[AssetCountsResult]))
          case _ => Right(s"unsupported result type ${metricType.toString}")
        }
      }
      else Left(MetricResult(status, metricType, definition.as[MetricErrorDefinition]))
    }
  )

  implicit val metricFormat: Format[MetricResult] = new Format[MetricResult] {

    def reads(json: JsValue) =
      json.as[Either[MetricResult, ErrorMessage]] match {
        case Left(metric) => JsSuccess(metric)
        case Right(error) => JsError(error)
      }

    def writes(metric: MetricResult) = {
      metric.definition match {
        case definition: TopKUsersPerAssetResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: AssetDistributionBySensitivityTagResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: QueriesAndSensitivityDistributionResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: SecureAssetAccessUserCountResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: SensitivityDistributionResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: TopKCollectionsResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: TopKAssetsResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: AssetCountsResult => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case definition: MetricErrorDefinition => Json.toJson(Map(resultStatusIdentifier -> JsBoolean(metric.status),
          metricTypeIdentifier -> JsString(metric.metricType.toString), resultDefinitionIdentifier -> Json.toJson(definition)))
        case _ => JsNull
      }

    }
  }
}
