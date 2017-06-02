package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import play.api.libs.json.JsValue

import scala.concurrent.Future

trait AtlasInterface {

  def findHiveTables(filters:AtlasSearchQuery):Future[AtlasEntities]
  def getHiveAttributes:Future[Seq[AtlasAttribute]]
  def getAtlasEntity(uuid:String):Future[JsValue]
  def getAtlasEntities(uuids:Iterable[String]):Future[JsValue]
  def getAtlasLineage(uuid:String,depth:Option[String]):Future[JsValue]

}
