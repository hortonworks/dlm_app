package models

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster}
import play.api.libs.json.Json
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

object RequestSyntax {
  case class RegisterLake(lake: DataplaneCluster, cluster: Cluster)
}

object Formatters {
  import models.RequestSyntax._

  implicit val registerLakeWrites = Json.writes[RegisterLake]
  implicit val registerLakeReads = Json.reads[RegisterLake]
}
