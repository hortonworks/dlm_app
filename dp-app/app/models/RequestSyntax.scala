package models

import com.hortonworks.dataplane.commons.domain.Atlas.Entity
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster}
import play.api.libs.json.Json

object RequestSyntax {
  case class RegisterDpCluster(lake: DataplaneCluster, cluster: Cluster)

}

object Formatters {
  import models.RequestSyntax._

  implicit val registerDpClusterWrites = Json.writes[RegisterDpCluster]
  implicit val registerDpClusterReads = Json.reads[RegisterDpCluster]
}
