/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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

  case class Notification(`type`: Option[String], to: Option[String])

  case class PolicyDataResponse(policyId: String, name: String, `type`: String, status : String, description: Option[String],
                                executionType: Option[String], sourceDataset: String, targetDataset: String,
                                sourceCluster: String, targetCluster: String, startTime: Option[String], endTime: String,
                                frequencyInSec: Long, tags: Option[String], customProperties: Map[String, String],
                                user: String, retryAttempts: Long, retryDelay: Long)

  case class PolicyStatusResponse(status: String, message: String, requestId: String)

  case class PostActionResponse(requestId: String, message: String, status: String)

  case class PolicyInstanceResponse(id: String, policyId: String, name: String, `type`: String, executionType: String,
                                    user: String, status: String, startTime: String, endTime: Option[String],
                                    trackingInfo: Option[String], message: Option[String])

  case class PolicyInstancesDetails(totalResults: Long, results: Long, instance: Seq[PolicyInstanceResponse])

  case class PoliciesDetailResponse(policyId: String, name: String, description: Option[String], `type`: String,
                                    status: String, sourceDataset: String, targetDataset: String, frequencyInSec: Long,
                                    sourceCluster: String, targetCluster: String, instances: Seq[PolicyInstanceResponse],
                                    startTime: Option[String], endTime: String, executionType: Option[String], customProperties: Option[Map[String, String]])

  case class BeaconEventResponse(policyId: Option[String], instanceId: Option[String], event: String, eventType: String,
                                 policyReplType: Option[String], severity: String, syncEvent: Option[Boolean],
                                 timestamp: String, message: String)

  case class BeaconLogResponse(status: String, message: String, requestId: String)

  case class BeaconAdminStatusResponse(status: String, version: String, plugins: String, security: String, wireEncryption: Boolean)

  case class BeaconAdminStatusDetails(clusterId: Long, beaconAdminStatus: BeaconAdminStatusResponse)

  case class HdfsFile(accessTime: Long, blockSize: Long, group: String, length: Long, modificationTime: Long,
                      owner: String, pathSuffix: String, permission: String, replication: Int, `type`: String)

  case class BeaconHdfsFileResponse(status: String, message: String, requestId: String, totalResults: Long, fileList: Seq[HdfsFile])
}

object RequestEntities {
  case class RangerServiceDetails (rangerEndPoint: String, rangerHDFSServiceName: String, rangerHIVEServiceName: Option[String])
  case class ClusterDefinitionRequest( name: String, dataCenter: String, description: String, local: Boolean = false,
                                       beaconEndpoint: String, nameNodeConfigs: Map[String, Option[String]],
                                       rangerService: Option[RangerServiceDetails], hsEndpoint: Option[String],
                                       hsKerberosPrincipal: Option[String])
  
  case class PolicyDefinitionRequest( name: String, `type`: String, sourceDataset: String,
                                      sourceCluster: String, targetCluster: String, frequencyInSec: Long,
                                      startTime: Option[String], endTime: Option[String], distcpMaxMaps: Option[Long],
                                      distcpMapBandwidth: Option[Long], queueName: Option[String], description: Option[String])
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

  implicit val beaconAdminStatusResponseWrites = Json.writes[BeaconAdminStatusResponse]
  implicit val beaconAdminStatusResponseReads = Json.reads[BeaconAdminStatusResponse]

  implicit val beaconAdminStatusDetailsWrites = Json.writes[BeaconAdminStatusDetails]
  implicit val beaconAdminStatusDetailsReads = Json.reads[BeaconAdminStatusDetails]

  implicit val hdfsFileWrites = Json.writes[HdfsFile]
  implicit val hdfsFileReads = Json.reads[HdfsFile]

  implicit val beaconHdfsFileResponseWrites = Json.writes[BeaconHdfsFileResponse]
  implicit val beaconHdfsFileResponseReads = Json.reads[BeaconHdfsFileResponse]

  //-- RequestEntities

  implicit val policyDefinitionRequestWrites = Json.writes[PolicyDefinitionRequest]
  implicit val policyDefinitionRequestReads = Json.reads[PolicyDefinitionRequest]
}


