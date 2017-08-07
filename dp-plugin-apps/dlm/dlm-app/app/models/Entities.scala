/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dlm.beacon.domain.RequestEntities._
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import play.api.libs.json.Json
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._

import scala.collection.immutable.Set.Set2


object Entities {


  case class DlmApiErrors(errors: Seq[BeaconApiErrors])
  // Response schema received from Dataplane for the DLM enabled clusters

  case class ClusterServiceEndpointDetails(id: Option[Long], servicename: String, clusterid: Option[Long] = None,
                                           servicehost: String, fullURL: String)


  case class ClusterStats(CapacityTotal: Option[Double], CapacityUsed: Option[Double], CapacityRemaining: Option[Double])

  case class BeaconCluster(id: Long, name: String, dataCenter: String, description: String, ambariurl: Option[String] = None,
                          stats: Option[ClusterStats], totalHosts: Option[Long], location: Location, services: Seq[ClusterServiceEndpointDetails] = Seq())

  case class BeaconClusters(clusters: Seq[BeaconCluster])


  case class ClusterDefinitionDetails (cluster:Cluster, dpCluster: DataplaneCluster, nnClusterService : ClusterServiceEndpointDetails, hiveServerService : Either[Errors, ClusterServiceEndpointDetails],
                                       clusterDefinitions: Seq[PairedCluster], pairedClusterRequest:PairClusterRequest)

  // Request schema submitted to Beacon for cluster definition
  case class ClusterDefinition (beaconUrl:String, clusterId: Long, clusterDefRequest : ClusterDefinitionRequest)

  case class ClusterIdWithBeaconUrl (beaconUrl:String, clusterId: Long)

  // Request submitted to beacon client for pairing clusters
  case class PairClusterRequest(clusterId: Long, beaconUrl: String)

  // Response schema for Pair cluster request
  case class PairedClustersResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), pairedClusters: Set[Set2[BeaconCluster]] = Set())

  case class PoliciesDetails(policyId: String, name: String, description: Option[String], `type`: String, status: String, sourceDataset: String, targetDataset: String,
                             frequency: Long, startTime: Option[String], endTime: String, sourceCluster:String, targetCluster:String, jobs: Seq[PolicyInstanceResponse])

  case class PoliciesDetailsResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), policies: Seq[PoliciesDetails])

  case class PolicySubmitRequest(policyDefinition: PolicyDefinitionRequest, submitType: String)

  case class PolicyInstancesResponse(totalResults: Long, results: Long, jobs: Seq[PolicyInstanceResponse])

  case class EventsDetailResponse(unreachableBeacon: Seq[BeaconApiErrors] = Seq(), events: Seq[BeaconEventResponse])

}

object JsonFormatters {
  import models.Entities._

  implicit val dlmApiErrorsWrites = Json.writes[DlmApiErrors]
  implicit val dlmApiErrorsReads = Json.reads[DlmApiErrors]

  implicit val clusterServiceEndpointDetailsWrites = Json.writes[ClusterServiceEndpointDetails]
  implicit val clusterServiceEndpointDetailsReads = Json.reads[ClusterServiceEndpointDetails]

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

}

