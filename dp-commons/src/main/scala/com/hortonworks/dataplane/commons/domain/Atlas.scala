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

package com.hortonworks.dataplane.commons.domain

import play.api.libs.json.{JsObject, JsValue, Json}

object Atlas {

  case class AtlasAttribute(name: String, dataType: String)

  case class Entity(typeName: Option[String],
                    attributes: Option[Map[String, String]],
                    guid: Option[String],
                    status: Option[String],
                    displayText: Option[String],
                    tags : Option[Seq[String]],
                    datasetId: Option[Long],
                    datasetName: Option[String])

  case class EntityDatasetRelationship(guid: String,
                                       datasetId: Long,
                                       datasetName: String)

  case class AtlasEntities(entities: Option[List[Entity]])

  case class AssetProperties(typeName: Option[String],
                             attributes: JsObject,
                             guid: Option[String],
                             status: Option[String],
                             createdBy: Option[String],
                             updatedBy: Option[String],
                             createTime: Option[Long],
                             updateTime: Option[Long],
                             version: Option[Long],
                             classifications: Option[Seq[JsObject]]
                            )
  {
    private val requiredKeySet = Set("createTime", "name", "owner", "qualifiedName")

    def getEntity() = {
      val entityAttr: Map[String,String] = attributes.fields
        .filter(e => requiredKeySet.contains(e._1))
        .map(e => (e._1, try e._2.as[String] catch{case a: Throwable => e._2.toString()})).toMap
      Entity(typeName,
        Some(entityAttr),
        guid, status, entityAttr.get("name"), classifications.map(_.map( j => (j \ "typeName").as[String])), None, None)
    }
  }

  /**
    *
    * @param atlasAttribute
    * @param operation - one of [equals,lt,gt,lte,gte,nte]
    * @param operand - String representation of the expression RHS
    *
    *  A valid submission would be
    *  {"atlasAttribute":{"name":"owner","dataType":"string"},"operation":"equals","operand":"admin"}
    *
    */
  case class AtlasFilter(atlasAttribute: AtlasAttribute,
                         operation: String,
                         operand: String)

  /**
    * List of filters to be combined into a atlas DSL statement

    */
  case class AtlasSearchQuery(atlasFilters: Seq[AtlasFilter],
                              limit: Option[Int] = None,
                              offset: Option[Int] = None)

  implicit val atlasAttributeReads = Json.reads[AtlasAttribute]
  implicit val atlasAttributeWrites = Json.writes[AtlasAttribute]

  implicit val atlasFilterReads = Json.reads[AtlasFilter]
  implicit val atlasFilterWrites = Json.writes[AtlasFilter]

  implicit val atlasFiltersReads = Json.reads[AtlasSearchQuery]
  implicit val atlasFiltersWrites = Json.writes[AtlasSearchQuery]

  implicit val entityReads = Json.reads[Entity]
  implicit val entityWrites = Json.writes[Entity]

  implicit val entityDatasetRelationshipReads = Json.reads[EntityDatasetRelationship]
  implicit val entityDatasetRelationshipWrites = Json.writes[EntityDatasetRelationship]

  implicit val atlasEntitiesReads = Json.reads[AtlasEntities]
  implicit val atlasEntitiesWrites = Json.writes[AtlasEntities]

  implicit val assetPropertiesReads = Json.reads[AssetProperties]
  implicit val assetPropertiesWrites = Json.writes[AssetProperties]

}
