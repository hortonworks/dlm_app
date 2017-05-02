package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{PoliciesDetailResponse=>PolicyDetailsData,BeaconApiErrors, BeaconApiError, PairedCluster, PostActionResponse}
import com.hortonworks.dlm.beacon.WebService.{BeaconPairService, BeaconClusterService, BeaconPolicyService}
import com.hortonworks.dlm.beacon.domain.RequestEntities.ClusterDefinitionRequest

import scala.concurrent.ExecutionContext.Implicits.global
import models.Entities._

import scala.collection.immutable.Set.Set2
import scala.concurrent.Future
import scala.concurrent.Promise

/**
  * `BeaconService` class interacts with beacon rest APIs
  * @param beaconClusterService  beacon service to communicate with beacon cluster endpoints
  * @param beaconPairService beacon service to communictae with beacon pair endpoints
  * @param beaconPolicyService   beacon service to communictae with beacon policy endpoints
  * @param dataplaneService      dataplane service to interact with dataplane db service
  */
@Singleton
class BeaconService @Inject()(
   @Named("beaconClusterService") val beaconClusterService: BeaconClusterService,
   @Named("beaconPairService") val beaconPairService: BeaconPairService,
   @Named("beaconPolicyService") val beaconPolicyService: BeaconPolicyService,
          val dataplaneService: DataplaneService) {

  /**
    * Get list of all paired clusters
    *
    * @return  PairedClustersResponse
    */
  def getAllPairedClusters: Future[Either[BeaconApiErrors,PairedClustersResponse]] = {
    val p: Promise[Either[BeaconApiErrors,PairedClustersResponse]] = Promise()
    dataplaneService.getBeaconClusters.map(beaconClusters=>beaconClusters match {
      case Left(errors) =>  {
        p.success(Left(BeaconApiErrors(errors.errors.map(x=>BeaconApiError(x.code,x.message,None)))))
      }
      case Right(beaconCluster) => {
        val beaconClusters = beaconCluster.clusters
        val allPairedClusterFuture:Future[Seq[Either[BeaconApiErrors, Seq[PairedCluster]]]] =
          Future.sequence(beaconClusters.map((x) => beaconPairService.listPairedClusters(
            x.services.find(x => x.servicename == "BEACON_SERVER").get.fullURL.get)))
        for {
          allPairedClustersOption <- allPairedClusterFuture
        } yield {
          val allPairedClusters:Seq[PairedCluster] = allPairedClustersOption.filter(_.isRight).flatMap(_.right.get)
          val setOfPairedClusters: Set[Set2[BeaconCluster]] = allPairedClusters.foldLeft(Set():Set[Set2[String]]) {
            (acc, next) => {
              if (next.peers.isEmpty) acc else {
                next.peers.map(x=>Set(next.name,x).asInstanceOf[Set2[String]]).toSet ++ acc
              }
            }
          }.filter((x) => {  // filter cluster sets that are known to dataplane
             x.forall(clustername => beaconClusters.exists(x=>x.name == clustername))
          }).map(clusterNamePair=>{
            clusterNamePair.map(clusterName=>beaconClusters.find(x=>x.name==clusterName).get).asInstanceOf[Set2[BeaconCluster]]
          })

          val failedResponse:Seq[BeaconApiError] = allPairedClustersOption.filter(_.isLeft).flatMap(_.left.get.errors)
          val invalidBeaconResponse:Seq[BeaconApiError] = failedResponse.filter(_.code == "502")
          if (invalidBeaconResponse.isEmpty) {
            val unreachableBeaconClusters: Seq[String] = failedResponse.filter(_.code == "503").map(_.beaconUrl.get)
            p.success(Right(PairedClustersResponse(unreachableBeaconClusters, setOfPairedClusters)))
          } else {
            p.success(Left(BeaconApiErrors(invalidBeaconResponse)))
          }
        }
      }
    })
    p.future
  }

  /**
    * Pairs passed set of clusters
    * @param clustersToBePaired Set of clusters to be paired
    * @return  Future from promise
    */
  def pairClusters(clustersToBePaired: Set[PairClusterRequest]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()

    if (clustersToBePaired.size !=2) {
      val errorMsg : String =  "Request payload should be a set of two objects"
      p.success(Left(BeaconApiErrors(Seq(BeaconApiError("500", errorMsg, None)))))
    } else {
      val clustersToBePairedSeq = clustersToBePaired.toSeq
      for {
        clusterA <- dataplaneService.getCluster(clustersToBePairedSeq.head.clusterId)
        clusterB <- dataplaneService.getCluster(clustersToBePairedSeq.tail.head.clusterId)
        clusterAFs <- dataplaneService.getNameNodeService(clustersToBePairedSeq.head.clusterId)
        clusterBFs <- dataplaneService.getNameNodeService(clustersToBePairedSeq.tail.head.clusterId)
        peerClusterA <- beaconPairService.listPairedClusters(clustersToBePairedSeq.head.beaconUrl)
        peerClusterB <- beaconPairService.listPairedClusters(clustersToBePairedSeq.tail.head.beaconUrl)
      } yield {
        val futureFailedList = List(clusterA,clusterB,clusterAFs,clusterBFs,peerClusterA,peerClusterB).filter(_.isLeft)
        if (futureFailedList.isEmpty) {
          val listOfClusters = ClusterDefinitionDetails(clusterA.right.get,clusterAFs.right.get,peerClusterA.right.get,clustersToBePairedSeq.head) ::
            ClusterDefinitionDetails(clusterB.right.get,clusterBFs.right.get,peerClusterB.right.get,clustersToBePairedSeq.tail.head) :: Nil
          // Retrieve cluster definitions that is pending to be submitted to the beacon process
          val clusterDefsToBeSubmitted: Set[ClusterDefinition] = getClusterDefsToBeSubmitted(listOfClusters)
          if (clusterDefsToBeSubmitted.isEmpty) {
            createPair(listOfClusters,p)
          } else {
            Future.sequence(clusterDefsToBeSubmitted.toSeq.map((x) => beaconClusterService.createClusterDefinition(x.beaconUrl, x.clusterDefRequest.name, x.clusterDefRequest))).map({
              x => {
                if (!x.exists(_.isLeft)) {
                  createPair(listOfClusters,p)
                } else {
                  val errorMsg: String = "Error occurred while submitting cluster definition to Beacon service"
                  p.success(Left(BeaconApiErrors(Seq(BeaconApiError("500", errorMsg, None)))))
                }
              }
            })
          }
        } else {
          val errorMsg : String =  "Error occurred while getting API response from DB service or/and Beacon service"
          p.success(Left(BeaconApiErrors(Seq(BeaconApiError("500", errorMsg, None)))))
        }
      }
    }

    p.future
  }

  /**
    * Get set of [[ClusterDefinition]] that needs to be submitted to beacon clusters
    * as a perequisite before making actual 'pair clusters' beacon API call
    * @param listOfClusters list of cluster definition details
    * @return set of [[ClusterDefinition]]
    */
  private def getClusterDefsToBeSubmitted (listOfClusters: List[ClusterDefinitionDetails]): Set[ClusterDefinition] = {
    val clusterNames : Seq[String]= listOfClusters.map(_.cluster.name)
    listOfClusters.foldLeft(Set():Set[ClusterDefinition]) {
      (outerAcc, next) => {
        val accumulateClusters:Set[ClusterDefinition] = clusterNames.foldLeft(Set():Set[ClusterDefinition]){
          (acc, nextClusterName) => {
            if (next.pairedClusters.map(_.name).contains(nextClusterName)) acc else {
              val clusterToBePairedDetails : ClusterDefinitionDetails =  listOfClusters.find(_.cluster.name == nextClusterName).get
              val clusterDefinition : ClusterDefinition = ClusterDefinition (
                next.pairedClusterRequest.beaconUrl,
                ClusterDefinitionRequest(
                  clusterToBePairedDetails.nnClusterService.fullURL.getOrElse("hdfs://localhost:8020"),
                  clusterToBePairedDetails.pairedClusterRequest.beaconUrl,
                  clusterToBePairedDetails.cluster.name,
                  clusterToBePairedDetails.cluster.description
                )
              )
              acc.+(clusterDefinition)
            }
          }
        }
        outerAcc ++ accumulateClusters
      }
    }
  }

  /**
    *
    * @param listOfClusters  two item list of clusters that needs to be paired
    * @param p promise to be resolved when cluster pairing completes/fails
    * @return Unit
    */
  private def createPair(listOfClusters: List[ClusterDefinitionDetails], p: Promise[Either[BeaconApiErrors, PostActionResponse]]) = {
    beaconPairService.createClusterPair(listOfClusters.head.pairedClusterRequest.beaconUrl,
      listOfClusters.tail.head.cluster.name, listOfClusters.tail.head.pairedClusterRequest.beaconUrl).map({
      clusterPairResponse =>
        clusterPairResponse match {
          case Left(beaconApiErrors) => p.success(Left(beaconApiErrors))
          case Right(clusterPairResponse) => p.success(Right(clusterPairResponse))
        }
    })
  }

  /**
    * Unpairs passed set of clusters
    * @param clustersToBeUnpaired Set of clusters to be unpaired
    * @return Future from promise
    */
  def unPairClusters(clustersToBeUnpaired: Set[PairClusterRequest]) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    if (clustersToBeUnpaired.size != 2) {
      val errorMsg : String =  "Request payload should be a set of two objects"
      p.success(Left(BeaconApiErrors(Seq(BeaconApiError("500", errorMsg, None)))))
    } else {
      val clustersToBeUnpairedSeq = clustersToBeUnpaired.toSeq
      for {
        clusterA <- dataplaneService.getCluster( clustersToBeUnpairedSeq.head.clusterId)
        clusterB <- dataplaneService.getCluster( clustersToBeUnpairedSeq.tail.head.clusterId)
      } yield {
        val futureFailedList = List(clusterA,clusterB).filter(_.isLeft)
        if (futureFailedList.isEmpty) {
          beaconPairService.createClusterUnpair(clustersToBeUnpairedSeq.head.beaconUrl,clusterB.right.get.name,clustersToBeUnpairedSeq.tail.head.beaconUrl).map({
            case Left(beaconApiErrors) => p.success(Left(beaconApiErrors))
            case Right(clusterUnpairResponse) => p.success(Right(clusterUnpairResponse))
          })
        } else {
          val errorMsg : String =  "Error occurred while getting response for cluster API from DB service"
          p.success(Left(BeaconApiErrors(Seq(BeaconApiError("500", errorMsg, None)))))
        }
      }
    }
    p.future
  }

  /**
    * Get all policies for DLM enabled clusters
    * @return [[PoliciesDetailsResponse]]
    */
  def getAllPolicies : Future[Either[BeaconApiErrors, PoliciesDetailsResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PoliciesDetailsResponse]] = Promise()
    dataplaneService.getBeaconClusters.map {

      case Left(errors) => {
        p.success(Left(BeaconApiErrors(errors.errors.map(x => BeaconApiError(x.code, x.message, None)))))
      }
      case Right(beaconCluster) => {
        val beaconClusters = beaconCluster.clusters
        val allPoliciesFuture:Future[Seq[Either[BeaconApiErrors, Seq[PolicyDetailsData]]]] =
          Future.sequence(beaconClusters.map((x) => beaconPolicyService.listPolicies(
            x.services.find(x => x.servicename == "BEACON_SERVER").get.fullURL.get)))

        for {
          allPoliciesOption <- allPoliciesFuture
        } yield {
          val allPolicies:Seq[PolicyDetailsData] = allPoliciesOption.filter(_.isRight).flatMap(_.right.get)
          val allPoliciesData: List[PolicyDetailsData] = allPolicies.foldLeft(List():List[PolicyDetailsData]) {
            (acc, next) => {
              if (acc.exists(x=> x.name == next.name && x.sourceclusters.head == next.sourceclusters.head && x.targetclusters.head == next.targetclusters.head)) acc
              else {
                next :: acc
              }
            }
          }.reverse.filter((policy) => {  // filter policies on cluster set that are registered to dataplane
            beaconClusters.exists(x=>x.name == policy.sourceclusters.head)  && beaconClusters.exists(x=>x.name == policy.targetclusters.head)
          })

          val policiesDetails : Seq[PoliciesDetails] =  allPoliciesData.map(policy=>{
            PoliciesDetails(policy.name, policy.`type`, policy.status, policy.frequency, policy.startTime, policy.endTime, policy.sourceclusters.head, policy.targetclusters.head)
          })

          val failedResponse:Seq[BeaconApiError] = allPoliciesOption.filter(_.isLeft).flatMap(_.left.get.errors)

          val invalidBeaconResponse:Seq[BeaconApiError] = failedResponse.filter(_.code == "502")
          if (invalidBeaconResponse.isEmpty) {
            val unreachableBeaconClusters: Seq[String] = failedResponse.filter(_.code == "503").map(_.beaconUrl.get)
            p.success(Right(PoliciesDetailsResponse(unreachableBeaconClusters, policiesDetails)))
          } else {
            p.success(Left(BeaconApiErrors(invalidBeaconResponse)))
          }
        }
      }
    }
    p.future
  }

  /**
    * Get policy details
    * @param clusterId
    * @param policyName
    * @return
    */
  def getPolicy(clusterId: Long, policyName: String) : Future[Either[Errors, PolicyDetailsResponse]] = {
    val p: Promise[Either[Errors, PolicyDetailsResponse]] = Promise()
    dataplaneService.getServiceByName(clusterId,"BEACON_SERVER").map {
      case Left(errors) =>  p.success(Left(errors))
      case Right(beaconService) => {
        for {
          policyData <- beaconPolicyService.listPolicy(beaconService.fullURL.get, policyName)
          policyStatus <- beaconPolicyService.listPolicyStatus(beaconService.fullURL.get, policyName)
        } yield {
          val futureFailedList = List(policyData,policyStatus).filter(_.isLeft)
          if (futureFailedList.isEmpty) {
            p.success(Right(PolicyDetailsResponse(policyData.right.get, policyStatus.right.get)))
          } else {
            val errorMsg : String =  "Error occurred while getting policy details from Beacon server"
            p.success(Left(Errors(Seq(Error("500", errorMsg)))))
          }
        }
      }
    }
    p.future
  }
  
}
