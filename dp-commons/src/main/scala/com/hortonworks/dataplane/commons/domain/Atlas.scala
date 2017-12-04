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

import play.api.libs.json.{JsObject, Json}

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
                              offset: Option[Int] = None) {
    def isPaged =
      limit.isDefined && offset.isDefined && offset.get >= 0 && limit.get > 0
  }

  implicit val atlasAttributeFormat = Json.format[AtlasAttribute]
  implicit val atlasFilterFormat = Json.format[AtlasFilter]
  implicit val atlasFiltersFormat = Json.format[AtlasSearchQuery]
  implicit val entityFormat = Json.format[Entity]
  implicit val entityDatasetRelationshipFormat = Json.format[EntityDatasetRelationship]
  implicit val atlasEntitiesFormat = Json.format[AtlasEntities]
  implicit val assetPropertiesFormat = Json.format[AssetProperties]

}
