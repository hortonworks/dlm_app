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

package models

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dlm.beacon.domain.RequestEntities._
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import play.api.libs.json.Json
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import models.CloudAccountStatus.CloudAccountStatus
import models.HiveFileSystemType.HiveFileSystemType

import scala.collection.immutable.Set.Set2
import scala.concurrent.Future


object Entities {


  case class DlmApiErrors(errors: Seq[BeaconApiErrors])
  // Response schema received from Dataplane for the DLM enabled clusters

  case class ClusterServiceEndpointDetails(id: Option[Long], servicename: String, clusterid: Option[Long] = None,
                                           servicehost: String, serviceProperties: Map[String, Option[String]])


  case class ClusterStats(CapacityTotal: Option[Double], CapacityUsed: Option[Double], CapacityRemaining: Option[Double])

  case class BeaconCluster(id: Long, name: String, dataCenter: String, description: String, ambariurl: Option[String] = None,
                          stats: Option[ClusterStats], totalHosts: Option[Long], location: Location, beaconUrl: String)

  case class BeaconClusters(clusters: Seq[BeaconCluster])


  case class ClusterDefinitionDetails (cluster:Cluster, dpCluster: DataplaneCluster, nnClusterService : Map[String, Option[String]],
                                       hiveServerService : Map[String, Option[String]], rangerService: Option[RangerServiceDetails],
                                       clusterDefinitions: Seq[PairedCluster], pairedClusterRequest:PairClusterRequest)

  case class ClusterDetails (cluster:Cluster, dpCluster: DataplaneCluster)

  // Request schema submitted to Beacon for cluster definition
  case class ClusterDefinition (beaconUrl:String, clusterId: Long, clusterDefRequest : ClusterDefinitionRequest)

  case class ClusterIdWithBeaconUrl (beaconUrl:String, clusterId: Long)

  // Request submitted to beacon client for pairing clusters
  case class PairClusterRequest(clusterId: Long, beaconUrl: String)

  case class UnpairClusterDefinition(dpCluster: DataplaneCluster, beaconUrl: String, clusterId: Long, clusterDefinitions: Seq[PairedCluster])

  case class UnpairClusterRequest(beaconUrl: String, clusterId: Long, clusterName: String)

  // Response schema for Pair cluster request
  case class PairedClustersResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), pairedClusters: Set[Set2[BeaconCluster]] = Set())

  case class PoliciesDetails(policyId: String, name: String, description: Option[String], `type`: String,
                             executionType: Option[String], status: String, sourceDataset: String, targetDataset: String,
                             frequency: Long, creationTime: Option[String], startTime: Option[String], endTime: String, sourceCluster:Option[String],
                             targetCluster:Option[String], customProperties: Option[Map[String, String]],
                             jobs: Seq[PolicyInstanceResponse], report: PolicyReport)

  case class PoliciesDetailsResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), policies: Seq[PoliciesDetails])

  case class PolicySubmitRequest(policyDefinition: PolicyDefinitionRequest)

  case class PolicyInstancesResponse(totalResults: Long, results: Long, jobs: Seq[PolicyInstanceResponse])

  case class EventsDetailResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), events: Seq[BeaconEventResponse])
  
  case class AdminStatusResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), response: Seq[BeaconAdminStatusDetails])

  case class YarnQueueDefinition(name: String, children: Seq[YarnQueueDefinition], path: String)
  case class YarnQueuesResponse(items: Seq[YarnQueueDefinition])
  case class CloudCredentialStatus(name: String, status: CloudAccountStatus)
  case class CloudCredPoliciesEither(cloudCred: Either[BeaconApiErrors, CloudCredsBeaconResponse], policies: Either[BeaconApiErrors, Seq[PoliciesDetailResponse]])
  case class CloudCredPolicies(cloudCred: CloudCredsBeaconResponse, policies: Seq[PoliciesDetails])
  case class ClusterCred(clusterId: Long, isInSync: Boolean = true)
  case class CloudCredWithPolicies(name: String, policies: Seq[PoliciesDetails], clusters: Seq[ClusterCred], cloudCred: Option[CloudCredResponse])
  case class CloudCredWithPoliciesResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), allCloudCreds: Seq[CloudCredWithPolicies])
  case class CloudCredsDetailResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), allCloudCreds: Seq[CloudCredsBeaconResponse])
  case class CloudCredsUpdateResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq())

  case class BeaconClusterConfigDetials(clusterId: Long, underlyingFsForHive: Option[HiveFileSystemType], configs: Map[String, String])
  case class BeaconClusterConfig(unreachableAmbari: Seq[BeaconApiErrors] = Seq(), configDetails: Seq[BeaconClusterConfigDetials])
}

object JsonFormatters {
  import models.Entities._

  implicit val dlmApiErrorsWrites = Json.writes[DlmApiErrors]
  implicit val dlmApiErrorsReads = Json.reads[DlmApiErrors]

  implicit val clusterStatsWrites = Json.writes[ClusterStats]
  implicit val clusterStatsReads = Json.reads[ClusterStats]

  implicit val beaconClusterWrites = Json.writes[BeaconCluster]
  implicit val beaconClusterReads = Json.reads[BeaconCluster]

  implicit val beaconClustersWrites = Json.writes[BeaconClusters]
  implicit val beaconClustersReads = Json.reads[BeaconClusters]

  implicit val pairedClusterRequestWrites = Json.writes[PairClusterRequest]
  implicit val pairedClusterRequestReads = Json.reads[PairClusterRequest]

  implicit val pairedClustersResponseWrites = Json.writes[PairedClustersResponse]

  implicit val policiesDetailsReads = Json.reads[PoliciesDetails]
  implicit val policiesDetailsWrites = Json.writes[PoliciesDetails]

  implicit val policiesDetailsResponseReads = Json.reads[PoliciesDetailsResponse]
  implicit val policiesDetailsResponseWrites = Json.writes[PoliciesDetailsResponse]

  implicit val policySubmitRequestReads = Json.reads[PolicySubmitRequest]
  implicit val policySubmitRequestWrites = Json.writes[PolicySubmitRequest]

  implicit val policyInstancesResponseReads = Json.reads[PolicyInstancesResponse]
  implicit val policyInstancesResponseWrites = Json.writes[PolicyInstancesResponse]

  implicit val eventsDetailResponseReads = Json.reads[EventsDetailResponse]
  implicit val eventsDetailResponseWrites = Json.writes[EventsDetailResponse]

  implicit val adminStatusResponseReads = Json.reads[AdminStatusResponse]
  implicit val adminStatusResponseWrites = Json.writes[AdminStatusResponse]

  implicit val yarnQueueDefinitionReads = Json.reads[YarnQueueDefinition]
  implicit val yarnQueueDefinitionWrites = Json.writes[YarnQueueDefinition]

  implicit val yarnQueuesResponseReads = Json.reads[YarnQueuesResponse]
  implicit val yarnQueuesResponseWrites = Json.writes[YarnQueuesResponse]

  implicit val cloudCredentialStatusReads = Json.reads[CloudCredentialStatus]
  implicit val cloudCredentialStatusWrites = Json.writes[CloudCredentialStatus]

  implicit val clusterCredReads = Json.reads[ClusterCred]
  implicit val clusterCredWrites = Json.writes[ClusterCred]

  implicit val cloudCredWithPoliciesReads = Json.reads[CloudCredWithPolicies]
  implicit val cloudCredWithPoliciesWrites = Json.writes[CloudCredWithPolicies]

  implicit val cloudCredWithPoliciesResponseReads = Json.reads[CloudCredWithPoliciesResponse]
  implicit val cloudCredWithPoliciesResponseWrites = Json.writes[CloudCredWithPoliciesResponse]

  implicit val cloudCredsDetailResponseReads = Json.reads[CloudCredsDetailResponse]
  implicit val cloudCredsDetailResponseWrites = Json.writes[CloudCredsDetailResponse]

  implicit val cloudCredsUpdateResponseReads = Json.reads[CloudCredsUpdateResponse]
  implicit val cloudCredsUpdateResponseWrites = Json.writes[CloudCredsUpdateResponse]

  implicit val beaconClusterConfigDetialsReads = Json.reads[BeaconClusterConfigDetials]
  implicit val beaconClusterConfigDetialsWrites = Json.writes[BeaconClusterConfigDetials]

  implicit val beaconClusterConfigReads = Json.reads[BeaconClusterConfig]
  implicit val beaconClusterConfigWrites = Json.writes[BeaconClusterConfig]

}

