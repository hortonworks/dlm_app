package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Atlas.AtlasAttribute

import scala.concurrent.Future

trait AtlasInterface {

  def getHiveAttributes:Future[Seq[AtlasAttribute]]

}
