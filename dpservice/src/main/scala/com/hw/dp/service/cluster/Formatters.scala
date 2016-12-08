package com.hw.dp.service.cluster

import java.util.Date

import play.api.libs.json.{JsObject, Json, OWrites, Writes}

/**
  * Uses implicit marco formats which are resolved at compile time, the order of these lines needs to be maintained
  */
object Formatters {

  implicit class OWritesExt[A](owrites: OWrites[A]) {


    def withConstant[B : Writes](key: String, value: B): OWrites[A] =
    withValue(key, _ => value)

    def withValue[B : Writes](key: String, value: A => B): OWrites[A] =

    new OWrites[A] {
      def writes(a: A): JsObject = owrites.writes(a) ++ Json.obj(key -> value(a))
    }

  }

  // Attach a last updated field to the serialized JSON, this is used by the clean up job to remove stale entries

  implicit val kerberosSettingsWrites = Json.writes[KerberosSettings]

  implicit val kerberosSettingsReads = Json.reads[KerberosSettings]

  implicit val credentialsWrites = Json.writes[Credentials]

  implicit val credentialsReads = Json.reads[Credentials]

  implicit val locationReads = Json.reads[Location]

  implicit val locationWrites = Json.writes[Location]

  implicit val ambariReads = Json.reads[Ambari]

  implicit val ambariWrites = Json.writes[Ambari].withConstant("lastUpdated",new Date().getTime)

  implicit val dataCenterReads = Json.reads[DataCenter]

  implicit val dataCenterWrites = Json.writes[DataCenter].withConstant("lastUpdated",new Date().getTime)

  implicit val diskInfoReads = Json.reads[DiskInfo]

  implicit val diskInfoReadsWrites = Json.writes[DiskInfo].withConstant("lastUpdated",new Date().getTime)

  implicit val clusterReads = Json.reads[Cluster]

  implicit val clusterWrites = Json.writes[Cluster].withConstant("lastUpdated",new Date().getTime)

  implicit val hostReads = Json.reads[Host]

  implicit val HostWrites = Json.writes[Host].withConstant("lastUpdated",new Date().getTime)

  implicit val serviceReads = Json.reads[Service]

  implicit val serviceWrites = Json.writes[Service].withConstant("lastUpdated",new Date().getTime)

  implicit val serviceComponentReads = Json.reads[ServiceComponent]

  implicit val serviceComponentWrites = Json.writes[ServiceComponent].withConstant("lastUpdated",new Date().getTime)

}
