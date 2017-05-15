package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconApiError, BeaconApiErrors, BeaconEventResponse, PairedCluster, PolicyDataResponse, PolicyInstanceResponse, PostActionResponse, PoliciesDetailResponse => PolicyDetailsData}
import com.hortonworks.dlm.beacon.WebService.{BeaconClusterService, BeaconPairService, BeaconPolicyInstanceService, BeaconPolicyService, BeaconEventService}
import com.hortonworks.dlm.beacon.domain.RequestEntities.ClusterDefinitionRequest

import scala.concurrent.ExecutionContext.Implicits.global
import models.Entities._
import models.PolicyAction
import models.{DELETE, RESUME, SCHEDULE, SUSPEND}

import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE, INTERNAL_SERVER_ERROR}

import scala.collection.immutable.Set.Set2
import scala.concurrent.Future
import scala.concurrent.Promise

/**
  * `BeaconService` class interacts with beacon rest APIs
  * @param beaconClusterService  beacon service to communicate with beacon cluster endpoints
  * @param beaconPairService beacon service to communicate with beacon pair endpoints
  * @param beaconPolicyService   beacon service to communicate with beacon policy endpoints
  * @param dataplaneService      dataplane service to interact with dataplane db service
  */
@Singleton
class BeaconService @Inject()(
   @Named("beaconClusterService") val beaconClusterService: BeaconClusterService,
   @Named("beaconPairService") val beaconPairService: BeaconPairService,
   @Named("beaconPolicyService") val beaconPolicyService: BeaconPolicyService,
   @Named("beaconPolicyInstanceService") val beaconPolicyInstanceService: BeaconPolicyInstanceService,
   @Named("beaconEventService") val beaconEventService: BeaconEventService,
          val dataplaneService: DataplaneService) {

  /**
    * Get list of all paired clusters
    *
    * @return PairedClustersResponse
    */
  def getAllPairedClusters: Future[Either[DlmApiErrors, PairedClustersResponse]] = {
    val p: Promise[Either[DlmApiErrors, PairedClustersResponse]] = Promise()
    dataplaneService.getBeaconClusters.map{
      case Left(errors) => {
        p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
      }
      case Right(beaconCluster) => {
        val beaconClusters = beaconCluster.clusters
        val allPairedClusterFuture: Future[Seq[Either[BeaconApiErrors, Seq[PairedCluster]]]] =
          Future.sequence(beaconClusters.map((x) => beaconPairService.listPairedClusters(
            x.services.find(x => x.servicename == DataplaneService.BEACON_SERVER).get.fullURL)))
        for {
          allPairedClustersOption <- allPairedClusterFuture
        } yield {
          val allPairedClusters: Seq[PairedCluster] = allPairedClustersOption.filter(_.isRight).flatMap(_.right.get)
          val setOfPairedClusters: Set[Set2[BeaconCluster]] = allPairedClusters.foldLeft(Set(): Set[Set2[String]]) {
            (acc, next) => {
              if (next.peers.isEmpty) acc else {
                next.peers.map(x => Set(next.name, x).asInstanceOf[Set2[String]]).toSet ++ acc
              }
            }
          }.filter((x) => { // filter cluster sets that are known to dataplane
            x.forall(clustername => beaconClusters.exists(x => x.name == clustername))
          }).map(clusterNamePair => {
            clusterNamePair.map(clusterName => beaconClusters.find(x => x.name == clusterName).get).asInstanceOf[Set2[BeaconCluster]]
          })

          val failedResponses: Seq[BeaconApiErrors] = allPairedClustersOption.filter(_.isLeft).map(_.left.get)
          if (failedResponses.length == beaconClusters.length) {
            p.success(Left(DlmApiErrors(failedResponses)))
          } else {
            p.success(Right(PairedClustersResponse(failedResponses, setOfPairedClusters)))
          }

        }
      }
    }
    p.future
  }

  /**
    * Pairs passed set of clusters
    *
    * @param clustersToBePaired Set of clusters to be paired
    * @return Future from promise
    */
  def pairClusters(clustersToBePaired: Set[PairClusterRequest]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()

    if (clustersToBePaired.size != 2) {
      val errorMsg: String = "Request payload should be a set of two objects"
      p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
    } else {
      val clustersToBePairedSeq = clustersToBePaired.toSeq
      for {
        clusterA <- dataplaneService.getCluster(clustersToBePairedSeq.head.clusterId)
        clusterB <- dataplaneService.getCluster(clustersToBePairedSeq.tail.head.clusterId)
        clusterAFs <- dataplaneService.getNameNodeService(clustersToBePairedSeq.head.clusterId)
        clusterBFs <- dataplaneService.getNameNodeService(clustersToBePairedSeq.tail.head.clusterId)
        hiveServiceA <- dataplaneService.getHiveServerService(clustersToBePairedSeq.head.clusterId)
        hiveServiceB <- dataplaneService.getHiveServerService(clustersToBePairedSeq.tail.head.clusterId)
        clusterBFs <- dataplaneService.getNameNodeService(clustersToBePairedSeq.tail.head.clusterId)
        clusterDefinitionsA <- beaconPairService.listPairedClusters(clustersToBePairedSeq.head.beaconUrl)
        clusterDefinitionsB <- beaconPairService.listPairedClusters(clustersToBePairedSeq.tail.head.beaconUrl)
      } yield {
        val futureFailedList = List(clusterA, clusterB, clusterAFs, clusterBFs, clusterDefinitionsA, clusterDefinitionsB).filter(_.isLeft)
        if (futureFailedList.isEmpty) {
          val listOfClusters = ClusterDefinitionDetails(clusterA.right.get, clusterAFs.right.get, hiveServiceA, clusterDefinitionsA.right.get, clustersToBePairedSeq.head) ::
            ClusterDefinitionDetails(clusterB.right.get, clusterBFs.right.get, hiveServiceB, clusterDefinitionsB.right.get, clustersToBePairedSeq.tail.head) :: Nil
          // Retrieve cluster definitions that is pending to be submitted to the beacon process
          val clusterDefsToBeSubmitted: Set[ClusterDefinition] = getClusterDefsToBeSubmitted(listOfClusters)
          if (clusterDefsToBeSubmitted.isEmpty) {
            createPair(listOfClusters, p)
          } else {
            Future.sequence(clusterDefsToBeSubmitted.toSeq.map((x) => beaconClusterService.createClusterDefinition(x.beaconUrl, x.clusterDefRequest.name, x.clusterDefRequest))).map({
              x => {
                if (!x.exists(_.isLeft)) {
                  createPair(listOfClusters, p)
                } else {
                  val errorMsg: String = "Error occurred while submitting cluster definition to Beacon service"
                  p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
                }
              }
            })
          }
        } else {
          val errorMsg: String = "Error occurred while getting API response from DB service or/and Beacon service"
          p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
        }
      }
    }

    p.future
  }

  /**
    * Get set of [[ClusterDefinition]] that needs to be submitted to beacon clusters
    * as a perequisite before making actual 'pair clusters' beacon API call
    *
    * @param listOfClusters list of cluster definition details
    * @return set of [[ClusterDefinition]]
    */
  private def getClusterDefsToBeSubmitted(listOfClusters: List[ClusterDefinitionDetails]): Set[ClusterDefinition] = {
    val clusterNames: Seq[String] = listOfClusters.map(_.cluster.name)
    listOfClusters.foldLeft(Set(): Set[ClusterDefinition]) {
      (outerAcc, next) => {
        val accumulateClusters: Set[ClusterDefinition] = clusterNames.foldLeft(Set(): Set[ClusterDefinition]) {
          (acc, nextClusterName) => {
            if (next.clusterDefinitions.map(_.name).contains(nextClusterName)) acc else {
              val clusterToBePairedDetails: ClusterDefinitionDetails = listOfClusters.find(_.cluster.name == nextClusterName).get
              val nnService = clusterToBePairedDetails.nnClusterService
              val hiveServerServiceUrl = clusterToBePairedDetails.hiveServerService match {
                case Right(hiveServerService) => Some(hiveServerService.fullURL)
                case Left(errors) => None
              }
              val clusterDefinition: ClusterDefinition = ClusterDefinition(
                next.pairedClusterRequest.beaconUrl,
                ClusterDefinitionRequest(
                  nnService.fullURL,
                  hiveServerServiceUrl,
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
    * @param listOfClusters two item list of clusters that needs to be paired
    * @param p              promise to be resolved when cluster pairing completes/fails
    * @return Unit
    */
  private def createPair(listOfClusters: List[ClusterDefinitionDetails], p: Promise[Either[BeaconApiErrors, PostActionResponse]]) = {
    beaconPairService.createClusterPair(listOfClusters.head.pairedClusterRequest.beaconUrl,
      listOfClusters.tail.head.cluster.name).map({
        case Left(beaconApiErrors) => p.success(Left(beaconApiErrors))
        case Right(clusterPairResponse) => p.success(Right(clusterPairResponse))
    })
  }

  /**
    * Unpairs passed set of clusters
    *
    * @param clustersToBeUnpaired Set of clusters to be unpaired
    * @return Future from promise
    */
  def unPairClusters(clustersToBeUnpaired: Set[PairClusterRequest]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    if (clustersToBeUnpaired.size != 2) {
      val errorMsg: String = "Request payload should be a set of two objects"
      p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
    } else {
      val clustersToBeUnpairedSeq = clustersToBeUnpaired.toSeq
      for {
        clusterA <- dataplaneService.getCluster(clustersToBeUnpairedSeq.head.clusterId)
        clusterB <- dataplaneService.getCluster(clustersToBeUnpairedSeq.tail.head.clusterId)
      } yield {
        val futureFailedList = List(clusterA, clusterB).filter(_.isLeft)
        if (futureFailedList.isEmpty) {
          beaconPairService.createClusterUnpair(clustersToBeUnpairedSeq.head.beaconUrl, clusterB.right.get.name).map({
            case Left(beaconApiErrors) => p.success(Left(beaconApiErrors))
            case Right(clusterUnpairResponse) => p.success(Right(clusterUnpairResponse))
          })
        } else {
          val errorMsg: String = "Error occurred while getting response for cluster API from DB service"
          p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
        }
      }
    }
    p.future
  }

  /**
    * Get all policies for DLM enabled clusters
    *
    * @return [[PoliciesDetailsResponse]]
    */
  def getAllPolicies: Future[Either[DlmApiErrors, PoliciesDetailsResponse]] = {
    val p: Promise[Either[DlmApiErrors, PoliciesDetailsResponse]] = Promise()
    dataplaneService.getBeaconClusters.map {

      case Left(errors) => {
        p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
      }
      case Right(beaconCluster) => {
        val beaconClusters = beaconCluster.clusters
        val allPoliciesFuture: Future[Seq[Either[BeaconApiErrors, Seq[PolicyDetailsData]]]] =
          Future.sequence(beaconClusters.map((x) => beaconPolicyService.listPolicies(
            x.services.find(x => x.servicename == DataplaneService.BEACON_SERVER).get.fullURL)))

        for {
          allPoliciesOption <- allPoliciesFuture
        } yield {
          val allPolicies: Seq[PolicyDetailsData] = allPoliciesOption.filter(_.isRight).flatMap(_.right.get)
          val allPoliciesData: List[PolicyDetailsData] = allPolicies.foldLeft(List(): List[PolicyDetailsData]) {
            (acc, next) => {
              if (acc.exists(x => x.name == next.name && x.sourceclusters.head == next.sourceclusters.head && x.targetclusters.head == next.targetclusters.head)) acc
              else {
                next :: acc
              }
            }
          }.reverse.filter((policy) => { // filter policies on cluster set that are registered to dataplane
            beaconClusters.exists(x => x.name == policy.sourceclusters.head) && beaconClusters.exists(x => x.name == policy.targetclusters.head)
          })

          val policiesDetails: Seq[PoliciesDetails] = allPoliciesData.map(policy => {
            PoliciesDetails(policy.name, policy.`type`, policy.status, policy.frequencyInSec, policy.startTime, policy.endTime, policy.sourceclusters.head, policy.targetclusters.head)
          })

          val failedResponses: Seq[BeaconApiErrors] = allPoliciesOption.filter(_.isLeft).map(_.left.get)
          if (failedResponses.length == beaconClusters.length) {
            p.success(Left(DlmApiErrors(failedResponses)))
          } else {
            p.success(Right(PoliciesDetailsResponse(failedResponses, policiesDetails)))
          }
        }
      }
    }
    p.future
  }

  /**
    * Get policy details
    *
    * @param clusterId
    * @param policyName
    * @return
    */
  def getPolicy(clusterId: Long, policyName: String): Future[Either[BeaconApiErrors, PolicyDataResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PolicyDataResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconService) => {
        beaconPolicyService.listPolicy(beaconService.fullURL, policyName).map({
          case Left(errors) => p.success(Left(errors))
          case Right(policyResponse) => p.success(Right(policyResponse))
        })
      }
    }
    p.future
  }

  /**
    * Create policy between paired clusters
    *
    * @param policySubmitRequest [[PolicySubmitRequest]]
    * @return
    */
  def createPolicy(clusterId: Long, policyName: String, policySubmitRequest: PolicySubmitRequest): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconService) => {
        val fullUrl = beaconService.fullURL
        val policyResponseFuture: Option[() => Future[Either[BeaconApiErrors, PostActionResponse]]] = Map(
          "SUBMIT" -> { () => beaconPolicyService.submitPolicy(fullUrl, policyName, policySubmitRequest.policyDefinition) },
          "SUBMIT_AND_SCHEDULE" -> { () => beaconPolicyService.submitAndSchedulePolicy(fullUrl, policyName, policySubmitRequest.policyDefinition) }
        ).get(policySubmitRequest.submitType)

        policyResponseFuture match {
          case Some(policyFuture) => {
            policyFuture().map {
              case Left(errors) => p.success(Left(errors))
              case Right(createPolicyResponse) => p.success(Right(createPolicyResponse))
            }
          }
          case None => {
            val errorMsg: String = "Value passed submitType=" + policySubmitRequest.submitType + " is invalid. Valid values for submitType are SUBMIT | SUBMIT_AND_SCHEDULE"
            p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
          }
        }
      }
    }
    p.future
  }

  /**
    * Execute actions on policy
    *
    * @param clusterId    name of the cluster
    * @param policyName   name of the policy
    * @param policyAction [[PolicyAction]] to be executed on the policy
    * @return
    */
  def updatePolicy(clusterId: Long, policyName: String, policyAction: PolicyAction): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconService) => {
        val fullUrl = beaconService.fullURL
        val policyActionResponseFuture: Future[Either[BeaconApiErrors, PostActionResponse]] = policyAction match {
          case SCHEDULE => beaconPolicyService.schedulePolicy(fullUrl, policyName)
          case SUSPEND => beaconPolicyService.suspendPolicy(fullUrl, policyName)
          case RESUME => beaconPolicyService.resumePolicy(fullUrl, policyName)
          case DELETE => beaconPolicyService.deletePolicy(fullUrl, policyName)
        }

        policyActionResponseFuture.map {
          case Left(errors) => p.success(Left(errors))
          case Right(policyActionResponse) => p.success(Right(policyActionResponse))
        }
      }
    }
    p.future
  }

  def getPolicyInstances(clusterId: Long, policyName: String, queryString: Map[String, String]): Future[Either[BeaconApiErrors, PolicyInstancesResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PolicyInstancesResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconService) =>
        val fullUrl = beaconService.fullURL
        beaconPolicyInstanceService.listPolicyInstance(fullUrl, policyName, queryString).map {
          case Left(errors) => p.success(Left(errors))
          case Right(policyInstanceService) => p.success(Right(PolicyInstancesResponse(policyInstanceService)))
        }
    }
    p.future
  }

  def getPolicyInstancesForCluster(clusterId: Long, queryString: Map[String, String]): Future[Either[BeaconApiErrors, PolicyInstancesResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PolicyInstancesResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconService) =>
        beaconPolicyInstanceService.listPolicyInstances(beaconService.fullURL, queryString).map {
          case Left(errors) => p.success(Left(errors))
          case Right(policyInstanceService) => p.success(Right(PolicyInstancesResponse(policyInstanceService)))
        }
    }
    p.future
  }

  def abortPolicyInstancesOnCluster(clusterId: Long, policyName: String): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconService) =>
        beaconPolicyInstanceService.abortPolicyInstances(beaconService.fullURL, policyName).map {
          case Left(errors) => p.success(Left(errors))
          case Right(response) => p.success(Right(response))
        }
    }
    p.future
  }

  def getAllEvents(queryString: Map[String, String]): Future[Either[DlmApiErrors, EventsDetailResponse]] = {
    val p: Promise[Either[DlmApiErrors, EventsDetailResponse]] = Promise()
    dataplaneService.getBeaconUrls.map ({
      case Left(errors) => p.success(Left(DlmApiErrors(errors.errors.map(x => BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(x.message)))))))
      case Right(beaconUrls) =>
        Future.sequence(beaconUrls.map(beaconEventService.listEvents(_, queryString))).map({
          eventListFromAllClusters => {
            val allEvents: Seq[BeaconEventResponse] = eventListFromAllClusters.filter(_.isRight).flatMap(_.right.get)
            val failedResponses: Seq[BeaconApiErrors] = eventListFromAllClusters.filter(_.isLeft).map(_.left.get)
            if (failedResponses.length == beaconUrls.length) {
              p.success(Left(DlmApiErrors(failedResponses)))
            } else {
              p.success(Right(EventsDetailResponse(failedResponses, allEvents)))
            }
          }
        })
    })
    p.future
  }
}
