package com.hortonworks.dataplane.cs.atlas

import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import org.apache.atlas.model.SearchFilter
import play.api.libs.json.JsValue

import scala.concurrent.Future

trait AtlasInterface {

  def findHiveTables(filters:AtlasSearchQuery)(implicit hJwtToken: Option[HJwtToken]):Future[AtlasEntities]
  def getHiveAttributes(implicit hJwtToken: Option[HJwtToken]):Future[Seq[AtlasAttribute]]
  def getAtlasEntity(uuid:String)(implicit hJwtToken: Option[HJwtToken]):Future[JsValue]
  def getAtlasEntities(uuids:Iterable[String])(implicit hJwtToken: Option[HJwtToken]):Future[JsValue]
  def getAtlasLineage(uuid:String,depth:Option[String])(implicit hJwtToken: Option[HJwtToken]):Future[JsValue]
  def getAtlasTypeDefs(searchFilter: SearchFilter)(implicit hJwtToken: Option[HJwtToken]):Future[JsValue]
}
