package com.hortonworks.dlm.beacon.domain

import play.api.libs.json.Json

object ResponseEntities {
  case class BeaconApiError(message: String, status: String = "FAILED", requestId: Option[String] = None)
  case class BeaconApiErrors(code: Int, beaconUrl: Option[String], error: Option[BeaconApiError] = None, message: Option[String] = None)

  case class PairedCluster(name:String, dataCenter:Option[String], peers: Seq[String])

  case class AclObject(owner:Option[String], group:Option[String], permission:Option[String])

  case class BeaconEntityResponse(name: String, description: String, dataCenter: Option[String], fsEndpoint: String,
                                  hsEndpoint: Option[String], beaconEndpoint: String, atlasEndpoint: Option[String],
                                  rangerEndpoint: Option[String], tags: Option[String], peers: Option[String],
                                  customProperties: Map[String, String], acl: AclObject, entityType: String)

  case class BeaconClusterStatusResponse(status:String, message: String, requestId: String)

  case class Retry(attempts: Long, delay: Long)

  case class Notification(`type`: Option[String], to: Option[String])

  case class PolicyDataResponse(policyId: String, name: String, `type`: String, status : String, executionType: Option[String],
                                sourceDataset: String, targetDataset: String, sourceCluster: String, targetCluster: String,
                                startTime: Option[String], endTime: String, frequencyInSec: Long, tags: Option[String],
                                customProperties: Map[String, String], retry: Retry, acl: Option[AclObject],
                                user: String, notification: Notification, entityType: String)

  case class PolicyStatusResponse(status: String, message: String, requestId: String)

  case class PostActionResponse(requestId: String, message: String, status: String)

  case class PolicyInstanceResponse(id: String, policyId: String, name: String, `type`: String, executionType: String,
                                    user: String, status: String, startTime: String, endTime: Option[String],
                                    trackingInfo: Option[String], message: Option[String])

  case class PolicyInstancesDetails(totalResults: Long, results: Long, instance: Seq[PolicyInstanceResponse])

  case class PoliciesDetailResponse(name: String, `type`: String, status: String, sourceDataset: String,
                                    targetDataset: String, frequencyInSec: Long, sourceCluster: String,
                                    targetCluster: String, instances: Seq[PolicyInstanceResponse],
                                    startTime: Option[String], endTime: String)

  case class BeaconEventResponse(policyId: Option[String], instanceId: Option[String], eventType: String, severity: String, timestamp: String, message: String)

  case class BeaconLogResponse(status: String, message: String, requestId: String)
}

object RequestEntities {
  case class ClusterDefinitionRequest( fsEndpoint: String, hsEndpoint: Option[String], beaconEndpoint: String, name: String, description: String)
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

  implicit val policyStatusResponseWrites = Json.writes[PolicyStatusResponse]
  implicit val policyStatusResponseReads = Json.reads[PolicyStatusResponse]

  implicit val postActionResponseWrites = Json.writes[PostActionResponse]
  implicit val postActionResponseReads = Json.reads[PostActionResponse]

  implicit val policyInstanceResponseWrites = Json.writes[PolicyInstanceResponse]
  implicit val policyInstanceResponseReads = Json.reads[PolicyInstanceResponse]

  implicit val policyInstancesDetailsWrites = Json.writes[PolicyInstancesDetails]
  implicit val policyInstancesDetailsReads = Json.reads[PolicyInstancesDetails]

  implicit val policiesDetailResponseWrites = Json.writes[PoliciesDetailResponse]
  implicit val policiesDetailResponseReads = Json.reads[PoliciesDetailResponse]

  implicit val eventResponseWrites = Json.writes[BeaconEventResponse]
  implicit val eventResponseReads = Json.reads[BeaconEventResponse]

  implicit val beaconLogResponseWrites = Json.writes[BeaconLogResponse]
  implicit val beaconLogResponseReads = Json.reads[BeaconLogResponse]

  //-- RequestEntities

  implicit val clusterDefinitionRequestWrites = Json.writes[ClusterDefinitionRequest]
  implicit val clusterDefinitionRequestReads = Json.reads[ClusterDefinitionRequest]

  implicit val policyDefinitionRequestWrites = Json.writes[PolicyDefinitionRequest]
  implicit val policyDefinitionRequestReads = Json.reads[PolicyDefinitionRequest]
}


