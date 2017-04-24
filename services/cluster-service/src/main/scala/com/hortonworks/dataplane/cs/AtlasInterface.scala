package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasFilters}

import scala.concurrent.Future

trait AtlasInterface {

  def findHiveTables(filters:AtlasFilters):Future[AtlasEntities]
  def getHiveAttributes:Future[Seq[AtlasAttribute]]

}
