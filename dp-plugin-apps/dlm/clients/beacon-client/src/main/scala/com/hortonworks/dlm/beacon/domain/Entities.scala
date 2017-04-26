package com.hortonworks.dlm.beacon.domain

import java.lang.reflect.Field
import play.api.libs.json.Json

object ResponseEntities {
  case class BeaconApiError(code: String, message: String, beaconUrl: Option[String])
  case class BeaconApiErrors(errors: Seq[BeaconApiError] = Seq())

  case class PairedCluster(name:String, dataCenter:Option[String], peers: Seq[String])

  case class AclObject(owner:Option[String], group:Option[String], permission:Option[String])

  case class CustomProperties(properties: String*)

  case class BeaconEntityResponse(name: String, description: String, dataCenter: Option[String], fsEndpoint: String,
                                  hsEndpoint: Option[String], beaconEndpoint: String, tags: Option[String], peers: Option[String],
                                   customProperties: CustomProperties, acl: AclObject, entityType: String)

  case class BeaconClusterStatusResponse(status:String, message: String, requestId: String)

  case class PostActionResponse(requestId: String, message: String, status: String)
}

object RequestEntities {
  case class ClusterDefinitionRequest( fsEndpoint: String, beaconEndpoint: String, name: String, description: String)
}

object JsonFormatters {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._
  import com.hortonworks.dlm.beacon.domain.RequestEntities._

  val defaultJson = Json.using[Json.WithDefaultValues]

  implicit val beaconApiErrorWrites = Json.writes[BeaconApiError]
  implicit val beaconApiErrorReads = Json.reads[BeaconApiError]

  implicit val beaconApiErrorsWrites = Json.writes[BeaconApiErrors]
  implicit val beaconApiErrorsReads = Json.reads[BeaconApiErrors]

  implicit val pairedClusterWrites = Json.writes[PairedCluster]
  implicit val pairedClusterReads = Json.reads[PairedCluster]
  
  implicit val aclObjectWrites = Json.writes[AclObject]
  implicit val aclObjectReads = Json.reads[AclObject]

  implicit val customPropertiesWrites = Json.writes[CustomProperties]
  implicit val customPropertiesReads = Json.reads[CustomProperties]

  implicit val beaconEntityResponseWrites = Json.writes[BeaconEntityResponse]
  implicit val beaconEntityResponseReads = Json.reads[BeaconEntityResponse]

  implicit val beaconClusterStatusResponseWrites = Json.writes[BeaconClusterStatusResponse]
  implicit val beaconClusterStatusResponseReads = Json.reads[BeaconClusterStatusResponse]

  implicit val postActionResponseWrites = Json.writes[PostActionResponse]
  implicit val postActionResponseReads = Json.reads[PostActionResponse]

  //-- RequestEntities

  implicit val clusterDefinitionRequestWrites = Json.writes[ClusterDefinitionRequest]
  implicit val clusterDefinitionRequestReads = Json.reads[ClusterDefinitionRequest]
}


