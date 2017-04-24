package com.hortonworks.dataplane.commons.domain

import play.api.libs.json.Json


object Atlas {


  case class AtlasAttribute(name:String,dataType:String)

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
  case class AtlasFilter(atlasAttribute: AtlasAttribute,operation:String,operand:String)

  /**
    * List of filters to be combined into a atlas DSL statement

    */
  case class AtlasFilters(atlasFilters: Seq[AtlasFilter])

  implicit val attributeReads = Json.reads[AtlasAttribute]
  implicit val attributeWrites = Json.writes[AtlasAttribute]



}
