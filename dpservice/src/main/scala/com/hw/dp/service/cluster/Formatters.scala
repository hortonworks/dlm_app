package com.hw.dp.service.cluster

import play.api.libs.json.Json

/**
  * Uses implicit marco formats which are resolved at compile time, the order of these lines needs to be maintained
  */
object Formatters {

  implicit val credentialsWrites = Json.writes[Credentials]

  implicit val credentialsReads = Json.reads[Credentials]

  implicit val locationReads = Json.reads[Location]

  implicit val locationWrites = Json.writes[Location]

  implicit val ambariReads = Json.reads[Ambari]

  implicit val ambariWrites = Json.writes[Ambari]

  implicit val dataCenterReads = Json.reads[DataCenter]

  implicit val dataCenterWrites = Json.writes[DataCenter]

  implicit val diskInfoReads = Json.reads[DiskInfo]

  implicit val diskInfoReadsWrites = Json.writes[DiskInfo]

  implicit val clusterReads = Json.reads[Cluster]

  implicit val clusterWrites = Json.writes[Cluster]

  implicit val hostReads = Json.reads[Host]

  implicit val HostWrites = Json.writes[Host]

  implicit val serviceReads = Json.reads[Service]

  implicit val serviceWrites = Json.writes[Service]

  implicit val serviceComponentReads = Json.reads[ServiceComponent]

  implicit val serviceComponentWrites = Json.writes[ServiceComponent]

  implicit val ambariDatacenterReads = Json.reads[AmbariDatacenter]

  implicit val ambariDatacenterWrites = Json.writes[AmbariDatacenter]


}
