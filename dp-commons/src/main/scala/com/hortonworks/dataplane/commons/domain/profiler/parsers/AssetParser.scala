/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.parsers

import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.AssetType.AssetType
import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.{Asset, AssetType, HDFSAssetDefinition, HiveAssetDefinition}

import play.api.libs.functional.syntax._
import play.api.libs.json._

object AssetParser {

  private val assetTypeIdentifier = "assetType"

  private val assetDefinitionIdentifier = "definition"

  private implicit val assetTypeFormat: Format[AssetType] = new Format[AssetType] {
    def reads(json: JsValue) = JsSuccess(AssetType.withName(json.as[String]))

    def writes(myEnum: AssetType) = JsString(myEnum.toString)
  }
  private implicit val hiveAssetFormat: Format[HiveAssetDefinition] = Json.format[HiveAssetDefinition]
  private implicit val hdfsAssetFormat: Format[HDFSAssetDefinition] = Json.format[HDFSAssetDefinition]
  private implicit val assetRead: Reads[Either[Asset, ErrorMessage]] = ((JsPath \ assetTypeIdentifier).read[AssetType]
    and (JsPath \ assetDefinitionIdentifier).read[JsValue]) (
    (assetType, definition) => {
      assetType match {
        case AssetType.Hive => Left(Asset(AssetType.Hive, definition.as[HiveAssetDefinition]))
        case AssetType.HDFS => Left(Asset(AssetType.HDFS, definition.as[HDFSAssetDefinition]))
        case _ => Right(s"unsupported asset type ${assetType.toString}")
      }
    }
  )

  implicit val assetFormat: Format[Asset] = new Format[Asset] {

    def reads(json: JsValue) =
      json.as[Either[Asset, ErrorMessage]] match {
        case Left(asset) => JsSuccess(asset)
        case Right(error) => JsError(error)
      }


    def writes(asset: Asset) = asset.definition match {
      case definition: HiveAssetDefinition => Json.toJson(Map(assetTypeIdentifier -> JsString(asset.assetType.toString), assetDefinitionIdentifier -> Json.toJson(definition)))
      case definition: HDFSAssetDefinition => Json.toJson(Map(assetTypeIdentifier -> JsString(asset.assetType.toString), assetDefinitionIdentifier -> Json.toJson(definition)))
      case _ => JsNull
    }
  }


}



