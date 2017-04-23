package com.hortonworks.dataplane.commons.domain

import play.api.libs.json.Json


object Atlas {

  case class AtlasAttribute(name:String,dataType:String)

  implicit val attributeReads = Json.reads[AtlasAttribute]
  implicit val attributeWrites = Json.writes[AtlasAttribute]

}
