/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package com.hortonworks.dlm.beacon.domain

import play.api.libs.json.Json

object ResponseEntities {
  case class BeaconApiError(message: String, status: String = "FAILED", requestId: Option[String] = None)
  case class BeaconApiErrors(code: Int, beaconUrl: Option[String], error: Option[BeaconApiError] = None, message: Option[String] = None)

  case class PeerInfo(clusterName: String, pairStatus: String, statusMessage: Option[String])
  case class PairedCluster(name:String, dataCenter:Option[String], peers: Seq[String], peersInfo: Seq[PeerInfo])

  case class AclObject(owner:Option[String], group:Option[String], permission:Option[String])

  case class BeaconEntityResponse(name: String, version: Long, description: String, dataCenter: Option[String], fsEndpoint: Option[String],
                                  hsEndpoint: Option[String], beaconEndpoint: String, atlasEndpoint: Option[String],
                                  rangerEndpoint: Option[String], local: Boolean, peers: Seq[String], peersInfo: Seq[PeerInfo],
                                  customProperties: Map[String, String])

  case class BeaconEntitiesResponse(totalResults: Long, results: Long, cluster: Seq[BeaconEntityResponse])
  case class BeaconEntitiesWithClusterIdResponse(clusterId: Long, beaconUrl: String, dcClusterName: String, response: BeaconEntitiesResponse)

  case class BeaconClusterStatusResponse(status:String, message: String)

  case class Notification(`type`: Option[String], to: Option[String])

  case class PolicyDataResponse(policyId: String, name: String, `type`: String, status : String, description: Option[String],
                                executionType: Option[String], sourceDataset: String, targetDataset: String,
                                sourceCluster: String, targetCluster: String, creationTime: Option[String], startTime: Option[String],
                                endTime: String, frequencyInSec: Long, tags: Option[String], customProperties: Map[String, String],
                                user: String, retryAttempts: Long, retryDelay: Long)

  case class PolicyStatusResponse(status: String, message: String)

  case class PostActionResponse(requestId: Option[String], message: String, status: String)
  case class PostActionClusterResponse(clusterId: Long, postActionResponse: PostActionResponse)

  case class PolicyInstanceResponse(id: String, policyId: String, name: String, `type`: String, executionType: String,
                                    user: String, status: String, startTime: String, endTime: Option[String],
                                    trackingInfo: Option[String], message: Option[String])

  case class PolicyInstancesDetails(totalResults: Long, results: Long, instance: Seq[PolicyInstanceResponse])

  case class PolicyReportDetails(status: String, endTime: String)

  case class PolicyReport(lastSucceededInstance: Option[PolicyReportDetails], lastFailedInstance: Option[PolicyReportDetails])

  case class PoliciesDetailResponse(policyId: String, name: String, description: Option[String], `type`: String,
                                    status: String, sourceDataset: String, targetDataset: String, frequencyInSec: Long,
                                    sourceCluster: Option[String], targetCluster: Option[String], instances: Seq[PolicyInstanceResponse],
                                    report: PolicyReport, creationTime: Option[String], startTime: Option[String], endTime: String,
                                    executionType: Option[String], customProperties: Option[Map[String, String]], plugins: Option[Seq[String]])

  case class BeaconEventResponse(policyId: Option[String], instanceId: Option[String], event: String, eventType: String,
                                 policyReplType: Option[String], severity: String, syncEvent: Option[Boolean],
                                 timestamp: String, message: String)

  case class BeaconLogResponse(status: String, message: String)

  case class BeaconAdminStatusResponse(status: String, version: String, plugins: String, security: String,
                                       wireEncryption: Boolean, rangerCreateDenyPolicy: String, enableSnapshotBasedReplication: Option[Boolean],
                                       replication_TDE: Option[Boolean], replication_cloud_fs: Option[Boolean],
                                       replication_cloud_hive_withCluster: Option[Boolean], cloudHosted: Option[Boolean],
                                       policy_edit: Option[Boolean], clusterUpdateSupported: Option[Boolean],
                                       wasbReplicationSupported: Option[Boolean], gcsReplicationSupported: Option[Boolean],
                                       fileListingFilterEnabled: Option[Boolean])

  case class BeaconAdminStatusDetails(clusterId: Long, beaconEndpoint: String, beaconAdminStatus: BeaconAdminStatusResponse)

  case class HdfsFile(accessTime: Long, blockSize: Long, group: String, length: Long, modificationTime: Long,
                      owner: String, pathSuffix: String, permission: String, replication: Int, `type`: String,
                      isEncrypted: Option[Boolean], encryptionKeyName: Option[String], snapshottable: Option[Boolean])

  case class BeaconHdfsFileResponse(status: String, message: String, results: Option[Long], totalResults: Long, fileList: Seq[HdfsFile])

  case class HiveDbName(database: String, isEncrypted: Option[Boolean], encryptionKeyName: Option[String], snapshottable: Option[Boolean])
  
  case class BeaconHiveDbResponse(status: String, message: String, totalResults: Long, dbList: Seq[HiveDbName])

  case class HiveDbTables(database: String, isEncrypted: Option[Boolean], encryptionKeyName: Option[String], table: Seq[String])

  case class BeaconHiveDbTablesResponse(status: String, message: String, totalResults: Long, dbList: Seq[HiveDbTables])

  case class CloudCredPostResponse(status: String, message: String, entityId: String)

  case class CloudCredResponse(id: String, name: String, provider: String, creationTime: String, lastModifiedTime: String, configs: Option[Map[String, String]])

  case class CloudCredsResponse(totalResults: Long, results: Long, cloudCred: Seq[CloudCredResponse])

  case class CloudCredsBeaconResponse(clusterId: Long, beaconUrl: String, cloudCreds: CloudCredsResponse)

  case class UserDetailsResponse(userName: String, hdfsSuperUser: Boolean)

  case class StaleClusterResponse(id: Long, stale: Boolean = false, staleAtClusterIds: Seq[Long] = Seq())
  case class BeaconStaleClustersResponse(clusters: Seq[StaleClusterResponse])
}

object RequestEntities {
  case class RangerServiceDetails (rangerEndPoint: String, rangerHDFSServiceName: Option[String], rangerHIVEServiceName: Option[String])
  case class AtlasServiceDetails (atlasEndpoint: String, `atlas.authentication.method.kerberos`: Option[String], `atlas.sso.knox.providerurl`: Option[String])
  case class SharedServicesDetails (rangerServiceDetails: Option[RangerServiceDetails], atlasServiceDetails: Option[AtlasServiceDetails])
  case class ClusterDefinitionRequest( name: String, dataCenter: String, description: String, local: Boolean = false,
                                       beaconEndpoint: String, nameNodeConfigs: Map[String, Option[String]],
                                       sharedServiceConfigs: SharedServicesDetails, hiveConfigs: Map[String, Option[String]],
                                       `knox.gateway.url`: Option[String])

  case class ClusterUpdateRequest(beaconEndpoint: String, nameNodeConfigs: Map[String, Option[String]],
                                  rangerService: Option[RangerServiceDetails], hiveConfigs: Map[String, Option[String]],
                                  `knox.gateway.url`: Option[String])
  
  case class PolicyDefinitionRequest(name: String, `type`: String, sourceDataset: String, targetDataset: Option[String],
                                     cloudCred: Option[String], sourceCluster: Option[String], targetCluster: Option[String],
                                     frequencyInSec: Long, startTime: Option[String], endTime: Option[String],
                                     distcpMaxMaps: Option[Long], distcpMapBandwidth: Option[Long], queueName: Option[String],
                                     `tde.sameKey`: Option[Boolean], description: Option[String], enableSnapshotBasedReplication: Option[Boolean],
                                     `cloud.encryptionAlgorithm`: Option[String], `cloud.encryptionKey`: Option[String],
                                     plugins: Option[String])

  case class PolicyTestRequest(`type`: String, policyName: String, cloudCred: Option[String], sourceCluster: Option[String], sourceDataset: Option[String],
                               targetDataset: Option[String], targetCluster: Option[String],
                               `cloud.encryptionAlgorithm`: Option[String], `cloud.encryptionKey`: Option[String])

  case class PolicyUpdateRequest(description: Option[String], `tde.sameKey`: Option[Boolean], frequencyInSec: Option[Long],
                                 startTime: Option[String], endTime: Option[String], distcpMapBandwidth: Option[Long],
                                 distcpMaxMaps: Option[Long], queueName: Option[String], enableSnapshotBasedReplication: Option[Boolean],
                                 plugins: Option[String])

  trait CloudCredRequest {
    def name: String
    def version: Long
    def provider: String
    def authtype: String
  }
  case class S3CloudCredRequest(name: String, version: Long, provider: String, authtype: String, `aws.access.key`: Option[String],
                              `aws.secret.key`: Option[String]) extends CloudCredRequest
  case class WASBCloudCredRequest(name: String, version: Long, provider: String, authtype: String, `wasb.account.name`: String,
                                  `wasb.access.key`: String) extends CloudCredRequest
  case class GcsCloudCredRequest(name: String, version: Long, provider: String, authtype: String, `gcs.private.key`: String,
                                 `gcs.client.email`: String, `gcs.private.key.id`: String) extends CloudCredRequest

}

object JsonFormatters {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._
  import com.hortonworks.dlm.beacon.domain.RequestEntities._

  val defaultJson = Json.using[Json.WithDefaultValues]

  implicit val beaconApiErrorWrites = Json.writes[BeaconApiError]
  implicit val beaconApiErrorReads = Json.reads[BeaconApiError]

  implicit val beaconApiErrorsWrites = Json.writes[BeaconApiErrors]
  implicit val beaconApiErrorsReads = Json.reads[BeaconApiErrors]

  implicit val peerInfoWrites = Json.writes[PeerInfo]
  implicit val peerInfoReads = Json.reads[PeerInfo]

  implicit val pairedClusterWrites = Json.writes[PairedCluster]
  implicit val pairedClusterReads = Json.reads[PairedCluster]
  
  implicit val aclObjectWrites = Json.writes[AclObject]
  implicit val aclObjectReads = Json.reads[AclObject]

  implicit val beaconEntityResponseWrites = Json.writes[BeaconEntityResponse]
  implicit val beaconEntityResponseReads = Json.reads[BeaconEntityResponse]

  implicit val beaconEntitiesResponseWrites = Json.writes[BeaconEntitiesResponse]
  implicit val beaconEntitiesResponseReads = Json.reads[BeaconEntitiesResponse]

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

  implicit val policyReportDetailsWrites = Json.writes[PolicyReportDetails]
  implicit val policyReportDetailsReads = Json.reads[PolicyReportDetails]

  implicit val policyReportWrites = Json.writes[PolicyReport]
  implicit val policyReportReads = Json.reads[PolicyReport]

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

  implicit val hiveDbNameWrites = Json.writes[HiveDbName]
  implicit val hiveDbNameReads = Json.reads[HiveDbName]

  implicit val beaconHiveDbResponseWrites = Json.writes[BeaconHiveDbResponse]
  implicit val beaconHiveDbResponseReads = Json.reads[BeaconHiveDbResponse]

  implicit val hiveDbTablesWrites = Json.writes[HiveDbTables]
  implicit val hiveDbTablesReads = Json.reads[HiveDbTables]

  implicit val beaconHiveDbTablesResponseWrites = Json.writes[BeaconHiveDbTablesResponse]
  implicit val beaconHiveDbTablesResponseReads = Json.reads[BeaconHiveDbTablesResponse]

  implicit val cloudCredPostResponseWrites = Json.writes[CloudCredPostResponse]
  implicit val cloudCredPostResponseReads = Json.reads[CloudCredPostResponse]

  implicit val cloudCredResponseWrites = Json.writes[CloudCredResponse]
  implicit val cloudCredResponseReads = Json.reads[CloudCredResponse]

  implicit val cloudCredsResponseWrites = Json.writes[CloudCredsResponse]
  implicit val cloudCredsResponseReads = Json.reads[CloudCredsResponse]

  implicit val cloudCredsBeaconResponseWrites = Json.writes[CloudCredsBeaconResponse]
  implicit val cloudCredsBeaconResponseReads = Json.reads[CloudCredsBeaconResponse]

  implicit val userDetailsResponseWrites = Json.writes[UserDetailsResponse]
  implicit val userDetailsResponseReads = Json.reads[UserDetailsResponse]

  implicit val beaconEntitiesWithClusterIdResponseWrites = Json.writes[BeaconEntitiesWithClusterIdResponse]
  implicit val beaconEntitiesWithClusterIdResponseReads = Json.reads[BeaconEntitiesWithClusterIdResponse]

  implicit val postActionClusterResponseFmt = Json.format[PostActionClusterResponse]




  //-- RequestEntities

  implicit val policyDefinitionRequestWrites = Json.writes[PolicyDefinitionRequest]
  implicit val policyDefinitionRequestReads = Json.reads[PolicyDefinitionRequest]

  implicit val policyTestRequestWrites = Json.writes[PolicyTestRequest]
  implicit val policyTestRequestReads = Json.reads[PolicyTestRequest]

  implicit val policyUpdateRequestFormat = Json.format[PolicyUpdateRequest]

  implicit val cloudCredRequestRequestWrites = Json.writes[S3CloudCredRequest]
  implicit val cloudCredRequestRequestReads = Json.reads[S3CloudCredRequest]
  implicit val wasbCloudCredRequestFmt = Json.format[WASBCloudCredRequest]
  implicit val gcsCloudCredRequestFmt = Json.format[GcsCloudCredRequest]

  implicit val staleClusterResponseFormat = Json.format[StaleClusterResponse]
  implicit val beaconStaleClustersResponseFormat = Json.format[BeaconStaleClustersResponse]
}


