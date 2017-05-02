package com.hortonworks.dlm.beacon.domain

import java.lang.reflect.Field
import play.api.libs.json.Json

object ResponseEntities {
  case class BeaconApiError(code: String, message: String, beaconUrl: Option[String])
  case class BeaconApiErrors(errors: Seq[BeaconApiError] = Seq())

  case class PairedCluster(name:String, dataCenter:Option[String], peers: Seq[String])

  case class AclObject(owner:Option[String], group:Option[String], permission:Option[String])

  case class BeaconEntityResponse(name: String, description: String, dataCenter: Option[String], fsEndpoint: String,
                                  hsEndpoint: Option[String], beaconEndpoint: String, tags: Option[String], peers: Option[String],
                                  customProperties: Map[String, String], acl: AclObject, entityType: String)

  case class BeaconClusterStatusResponse(status:String, message: String, requestId: String)

  case class Retry(attempts: Long, delay: Long)

  case class Notification(`type`: Option[String], to: Option[String])

  case class PolicyDataResponse(name: String, `type`: String, sourceDataset: String, targetDataset: String,
                                   sourceCluster: String, targetCluster: String, startTime: Option[String], endTime: String,
                                   frequencyInSec: Long, tags: Option[String], customProperties: Map[String, String], retry: Retry,
                                   acl: Option[AclObject], notification: Notification, entityType: String)

  case class PoliciesDetailResponse(name: String, `type`: String, status: String, frequency: Long,
                                    sourceclusters: Seq[String], targetclusters: Seq[String], startTime: Option[String], endTime: String)

  case class PolicyStatusResponse(status: String, message: String, requestId: String)

  case class PostActionResponse(requestId: String, message: String, status: String)
}

object RequestEntities {
  case class ClusterDefinitionRequest( fsEndpoint: String, beaconEndpoint: String, name: String, description: String)
  case class PolicyDefinitionRequest( name: String, `type`: String, sourceDataset: String,
                                      sourceCluster: String, targetCluster: String, frequencyInSec: Long,
                                      startTime: Option[String], endTime: Option[String])
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

  implicit val beaconEntityResponseWrites = Json.writes[BeaconEntityResponse]
  implicit val beaconEntityResponseReads = Json.reads[BeaconEntityResponse]

  implicit val beaconClusterStatusResponseWrites = Json.writes[BeaconClusterStatusResponse]
  implicit val beaconClusterStatusResponseReads = Json.reads[BeaconClusterStatusResponse]

  implicit val retryWrites = Json.writes[Retry]
  implicit val retryReads = Json.reads[Retry]

  implicit val notificationWrites = Json.writes[Notification]
  implicit val notificationReads = Json.reads[Notification]

  implicit val policyDataResponseWrites = Json.writes[PolicyDataResponse]
  implicit val policyDataResponseReads = Json.reads[PolicyDataResponse]

  implicit val policiesDetailResponseWrites = Json.writes[PoliciesDetailResponse]
  implicit val policiesDetailResponseReads = Json.reads[PoliciesDetailResponse]

  implicit val policyStatusResponseWrites = Json.writes[PolicyStatusResponse]
  implicit val policyStatusResponseReads = Json.reads[PolicyStatusResponse]

  implicit val postActionResponseWrites = Json.writes[PostActionResponse]
  implicit val postActionResponseReads = Json.reads[PostActionResponse]

  //-- RequestEntities

  implicit val clusterDefinitionRequestWrites = Json.writes[ClusterDefinitionRequest]
  implicit val clusterDefinitionRequestReads = Json.reads[ClusterDefinitionRequest]

  implicit val policyDefinitionRequestWrites = Json.writes[PolicyDefinitionRequest]
  implicit val policyDefinitionRequestReads = Json.reads[PolicyDefinitionRequest]
}


