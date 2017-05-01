package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasFilters}
import play.api.libs.json.JsValue

import scala.concurrent.Future

trait AtlasInterface {

  def findHiveTables(filters:AtlasFilters):Future[AtlasEntities]
  def getHiveAttributes:Future[Seq[AtlasAttribute]]
  def getAtlasEntity(uuid:String):Future[JsValue]

}
