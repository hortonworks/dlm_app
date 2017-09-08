/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
