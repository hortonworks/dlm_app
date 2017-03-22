package com.hortonworks.dataplane

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake}

trait ClusterInterface {

  def getDataLakes:Seq[Datalake]

  def getLinkedClusters(datalake: Datalake):Seq[Cluster]

}
