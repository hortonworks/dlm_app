package models

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, ClusterService, Datalake, Location}
import com.hortonworks.dlm.beacon.domain.RequestEntities.ClusterDefinitionRequest
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{PairedCluster, PoliciesDetailResponse, PolicyDataResponse, PolicyStatusResponse}
import play.api.libs.json.Json
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._

import scala.collection.immutable.Set.Set2


object Entities {

  // Response schema received from Dataplane for the DLM enabled clusters
  case class BeaconCluster(id: Long, name: String, description: String, ambariurl: Option[String] = None,
                            datalake: Datalake, location: Location, services: Seq[ClusterService] = Seq())

  case class BeaconClusters(clusters: Seq[BeaconCluster])


  case class ClusterDefinitionDetails (cluster:Cluster, nnClusterService : ClusterService,
                                       pairedClusters: Seq[PairedCluster], pairedClusterRequest:PairClusterRequest)

  // Request schema submitted to Beacon for cluster definition
  case class ClusterDefinition (beaconUrl:String, clusterDefRequest : ClusterDefinitionRequest)

  // Request submitted to beacon client for pairing clusters
  case class PairClusterRequest(clusterId: Long, beaconUrl: String)

  // Response schema for Pair cluster request
  case class PairedClustersResponse(unreachableBeacon: Seq[String] = Seq(), pairedClusters: Set[Set2[BeaconCluster]] = Set())

  case class PolicyDetailsResponse(policyDetails: PolicyDataResponse, policyStatus: PolicyStatusResponse)

  case class PoliciesDetails(name: String, `type`: String, status: String, frequency: Long, startTime: Option[String], endTime: String,
                             sourceCluster:String, targetCluster:String)

  case class PoliciesDetailsResponse(unreachableBeacon: Seq[String] = Seq(), policies: Seq[PoliciesDetails])

}

object JsonFormatters {
  import models.Entities._
  implicit val beaconClusterWrites = Json.writes[BeaconCluster]
  implicit val beaconClusterReads = Json.reads[BeaconCluster]

  implicit val beaconClustersWrites = Json.writes[BeaconClusters]
  implicit val beaconClustersReads = Json.reads[BeaconClusters]

  implicit val pairedClusterRequestWrites = Json.writes[PairClusterRequest]
  implicit val pairedClusterRequestReads = Json.reads[PairClusterRequest]

  implicit val pairedClustersResponseWrites = Json.writes[PairedClustersResponse]

  implicit val policyDetailsResponseReads = Json.reads[PolicyDetailsResponse]
  implicit val policyDetailsResponseWrites = Json.writes[PolicyDetailsResponse]

  implicit val policiesDetailsReads = Json.reads[PoliciesDetails]
  implicit val policiesDetailsWrites = Json.writes[PoliciesDetails]

  implicit val policiesDetailsResponseReads = Json.reads[PoliciesDetailsResponse]
  implicit val policiesDetailsResponseWrites = Json.writes[PoliciesDetailsResponse]

}

