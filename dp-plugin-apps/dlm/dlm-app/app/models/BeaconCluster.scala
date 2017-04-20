package models

import com.hortonworks.dataplane.commons.domain.Entities.ClusterService
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import play.api.libs.json.Json

case class BeaconCluster(
   id: Long,
   name: String,
   description: String,
   datalakeid: Option[Long] = None,
   clusterServices: Seq[ClusterService] = Seq()
)

object BeaconCluster {

  implicit val beaconClusterFormat = Json.format[BeaconCluster]

}

