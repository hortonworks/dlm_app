package com.hortonworks.dataplane.commons.domain

import play.api.libs.json.Json

object Atlas {

  case class AtlasAttribute(name: String, dataType: String)

  case class Entity(typeName: Option[String],
                    attributes: Option[Map[String, String]],
                    guid: Option[String],
                    status: Option[String],
                    displayText: Option[String])

  case class AtlasEntities(entities: Option[List[Entity]])

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

  implicit val atlasAttributeReads = Json.reads[AtlasAttribute]
  implicit val atlasAttributeWrites = Json.writes[AtlasAttribute]

  implicit val atlasFilterReads = Json.reads[AtlasFilter]
  implicit val atlasFilterWrites = Json.writes[AtlasFilter]

  implicit val atlasFiltersReads = Json.reads[AtlasSearchQuery]
  implicit val atlasFiltersWrites = Json.writes[AtlasSearchQuery]

  implicit val entityReads = Json.reads[Entity]
  implicit val entityWrites = Json.writes[Entity]

  implicit val atlasEntitiesReads = Json.reads[AtlasEntities]
  implicit val atlasEntitiesWrites = Json.writes[AtlasEntities]

}
