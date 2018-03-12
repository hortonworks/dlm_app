/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.parsers

import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.Asset
import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext._
import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.MetricContextType._
import play.api.libs.functional.syntax._
import play.api.libs.json._
import AssetParser._

object ProfilerMetricContextParser {


  private val metricContextTypeIdentifier = "contextType"

  private val metricContextDefinitionIdentifier = "definition"

  private implicit val contextTypeFormat: Format[MetricContextType] = new Format[MetricContextType] {
    def reads(json: JsValue) = JsSuccess(MetricContextType.withName(json.as[String]))

    def writes(myEnum: MetricContextType) = JsString(myEnum.toString)
  }
  private implicit val collectionContextFormat: Format[CollectionContext] = Json.format[CollectionContext]
  private implicit val profileMetricContextRead: Reads[Either[ProfilerMetricContext, ErrorMessage]] = ((JsPath \ metricContextTypeIdentifier).read[MetricContextType]
    and (JsPath \ metricContextDefinitionIdentifier).read[JsValue]) (
    (contextType, definition) => {
      contextType match {
        case MetricContextType.CLUSTER => Left(ProfilerMetricContext(MetricContextType.CLUSTER, ClusterContext))
        case MetricContextType.COLLECTION => Left(ProfilerMetricContext(MetricContextType.COLLECTION, definition.as[CollectionContext]))
        case MetricContextType.ASSET => Left(ProfilerMetricContext(MetricContextType.ASSET, definition.as[Asset]))
        case _ => Right(s"unsupported context type ${contextType.toString}")
      }
    }
  )

  implicit val profileMetricContextFormat: Format[ProfilerMetricContext] = new Format[ProfilerMetricContext] {

    def reads(json: JsValue) = {
      json.as[Either[ProfilerMetricContext, ErrorMessage]] match {
        case Left(context) => JsSuccess(context)
        case Right(error) => JsError(error)
      }
    }

    def writes(context: ProfilerMetricContext) = context.definition match {
      case ClusterContext => Json.toJson(Map(metricContextTypeIdentifier -> JsString(context.contextType.toString), metricContextDefinitionIdentifier -> emptyJson))
      case definition: CollectionContext => Json.toJson(Map(metricContextTypeIdentifier -> JsString(context.contextType.toString), metricContextDefinitionIdentifier -> Json.toJson(definition)))
      case definition: Asset => Json.toJson(Map(metricContextTypeIdentifier -> JsString(context.contextType.toString), metricContextDefinitionIdentifier -> Json.toJson(definition)))
      case _ => JsNull
    }
  }

}
