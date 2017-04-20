package com.hortonworks.dlm.beacon.domain

import play.api.libs.json.Json

object ResponseEntities {
  case class BeaconApiError(code: String, message: String)
  case class BeaconApiErrors(errors: Seq[BeaconApiError] = Seq())

  case class BeaconCluster(name:String, peers: Seq[String], tags: Seq[String])

  case class BeaconClusterResponse(totalResults:Int, cluster: Seq[BeaconCluster])

  case class AclObject(owner:Option[String], group:Option[String], permission:Option[String])

  case class CustomProperties(properties: String*)

  case class BeaconEntityResponse(name: String, description: String, dataCenter: Option[String], fsEndpoint: String,
                                  hsEndpoint: Option[String], beaconEndpoint: String, tags: Option[String], peers: Option[String],
                                   customProperties: CustomProperties, acl: AclObject, entityType: String)

  case class BeaconClusterStatusResponse(status:String, message: String, requestId: String)
}

object JsonFormatters {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._

  val defaultJson = Json.using[Json.WithDefaultValues]

  implicit val beaconApiErrorWrites = Json.writes[BeaconApiError]
  implicit val beaconApiErrorReads = Json.reads[BeaconApiError]

  implicit val beaconApiErrorsWrites = Json.writes[BeaconApiErrors]
  implicit val beaconApiErrorsReads = Json.reads[BeaconApiErrors]

  implicit val beaconClusterWrites = Json.writes[BeaconCluster]
  implicit val beaconClusterReads = Json.reads[BeaconCluster]

  implicit val beaconClusterResponseWrites = Json.writes[BeaconClusterResponse]
  implicit val beaconClusterResponseReads = Json.reads[BeaconClusterResponse]

  implicit val aclObjectWrites = Json.writes[AclObject]
  implicit val aclObjectReads = Json.reads[AclObject]

  implicit val customPropertiesWrites = Json.writes[CustomProperties]
  implicit val customPropertiesReads = Json.reads[CustomProperties]

  implicit val beaconEntityResponseWrites = Json.writes[BeaconEntityResponse]
  implicit val beaconEntityResponseReads = Json.reads[BeaconEntityResponse]

  implicit val beaconClusterStatusResponseWrites = Json.writes[BeaconClusterStatusResponse]
  implicit val beaconClusterStatusResponseReads = Json.reads[BeaconClusterStatusResponse]
}


