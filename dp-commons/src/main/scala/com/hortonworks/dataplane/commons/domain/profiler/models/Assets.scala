/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.models

import com.hortonworks.dataplane.commons.domain.profiler.models.Assets.AssetType.AssetType
import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.MetricContextDefinition

object Assets {

  object AssetType extends Enumeration {
    type AssetType = Value
    val Hive, HDFS = Value
  }

  trait AssetDefinition

  case class Asset(assetType: AssetType, definition: AssetDefinition) extends MetricContextDefinition {
    override def retrieveAssets(assetListFromContext: Long => List[Asset]): List[Asset] = List(this)
  }

  case class HiveAssetDefinition(database: String, table: String) extends AssetDefinition

  case class HDFSAssetDefinition(path: String) extends AssetDefinition

}
