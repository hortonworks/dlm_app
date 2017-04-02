package models

import com.hortonworks.dataplane.commons.domain.Ambari.{ClusterHost, NameNodeInfo}
import play.api.libs.json.Json

case class ClusterHealthData(nameNodeInfo: Option[NameNodeInfo],
                             hosts: Seq[ClusterHost] = Seq())

object ClusterHealthData {
  implicit val clusterHealthDataWrites = Json.writes[ClusterHealthData]
  implicit val clusterHealthDataReads = Json.reads[ClusterHealthData]
}



