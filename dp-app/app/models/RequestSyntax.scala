package models

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake}
import play.api.libs.json.Json

object RequestSyntax {
  case class RegisterLake(lake: Datalake, cluster: Cluster);
}

object Formatters {
  import models.RequestSyntax._

  implicit val registerLakeWrites = Json.writes[RegisterLake]
  implicit val registerLakeReads = Json.reads[RegisterLake]
}
