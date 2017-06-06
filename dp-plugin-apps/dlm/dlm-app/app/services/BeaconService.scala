package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconApiError, BeaconApiErrors, BeaconEventResponse, PairedCluster, PolicyDataResponse, PostActionResponse, PoliciesDetailResponse => PolicyDetailsData}
import com.hortonworks.dlm.beacon.WebService.{BeaconClusterService, BeaconEventService, BeaconPairService, BeaconPolicyInstanceService, BeaconPolicyService}
import com.hortonworks.dlm.beacon.domain.RequestEntities.ClusterDefinitionRequest

import scala.concurrent.ExecutionContext.Implicits.global
import models.Entities._
import models.PolicyAction
import models.{DELETE, RESUME, SCHEDULE, SUSPEND, DESCEND}
import play.api.http.Status.INTERNAL_SERVER_ERROR

import scala.collection.immutable.Set.Set2
import scala.concurrent.Future
import scala.concurrent.Promise

/**
  * `BeaconService` class interacts with beacon rest APIs
  * @param beaconClusterService  beacon service to communicate with beacon cluster endpoints
  * @param beaconPairService beacon service to communicate with beacon pair endpoints
  * @param beaconPolicyService   beacon service to communicate with beacon policy endpoints
  * @param dataplaneService      dataplane service to interact with dataplane db service
  * @param webhdfsService        webhdfs client service
  */
@Singleton
class BeaconService @Inject()(
   @Named("beaconClusterService") val beaconClusterService: BeaconClusterService,
   @Named("beaconPairService") val beaconPairService: BeaconPairService,
   @Named("beaconPolicyService") val beaconPolicyService: BeaconPolicyService,
   @Named("beaconPolicyInstanceService") val beaconPolicyInstanceService: BeaconPolicyInstanceService,
   @Named("beaconEventService") val beaconEventService: BeaconEventService,
   val dataplaneService: DataplaneService,
   val webhdfsService: WebhdfsService) {

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

    if (clustersToBePaired.size != BeaconService.PAIR_CLUSTER_SIZE) {
      val errorMsg: String = BeaconService.clusterPairPaylodError
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
                  p.success(Left(x.find(_.isLeft).get.left.get))
                }
              }
            })
          }
        } else {
          val errorMsg: String = BeaconService.pairClusterError
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
                  ""
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
    if (clustersToBeUnpaired.size != BeaconService.PAIR_CLUSTER_SIZE) {
      val errorMsg: String = BeaconService.clusterPairPaylodError
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
          val failedErrorMsg = futureFailedList.head.left.get.errors.head.message
          val errorCode = futureFailedList.head.left.get.errors.head.code
          p.success(Left(BeaconApiErrors(errorCode.toInt, None, None, Some(failedErrorMsg))))
        }
      }
    }
    p.future
  }

  /**
    * Get transformed query string to be made against each beacon server
    * @param queryString querystring made ahgainst dlm-app
    * @return
    */
  def getQueryStringForResources(queryString : Map[String, String], pageLenth: Option[String], offset: Int) : Map[String, String] = {
    pageLenth  match {
      case None => queryString
      case Some(pageLength) =>
        val totalPageLength = (offset+ pageLength.toInt).toString
        queryString + (BeaconService.API_OFFSET_KEY -> BeaconService.API_OFFSET_DEFAULT_VALUE) + (BeaconService.API_PAGE_SIZE_KEY -> totalPageLength)
    }
  }

  /**
    * Gets ordered and paginated single response for the query made to DLM
    * @param resources                resources as responded and aggregated from all beacon servers
    * @param queryStringPaginated     API query  made against all beacon server
    * @param pageLenth                page size
    * @param offset                   offset of the page
    * @tparam T                       resource
    * @return
    */
  def getProcessedResponse[T <: AnyRef](resources: Seq[T], queryStringPaginated : Map[String, String],
                                        pageLenth: Option[String], offset: Int) : Seq[T] = {
    getPaginatedResponse(getOrderedResponse(resources, queryStringPaginated), pageLenth, offset)
  }

  /**
    * Gets paginated esponse for the query made to DLM
    * @param resources              resources as responded and aggregated from all beacon servers
    * @param pageLenth              page size
    * @param offset                 offset of the page
    * @tparam T                     resource
    * @return
    */
  def getPaginatedResponse[T <: AnyRef](resources: Seq[T], pageLenth: Option[String], offset: Int) : Seq[T] = {
    pageLenth match {
      case None => resources
      case Some(pageLength) => resources.slice(offset, offset + pageLength.toInt)
    }
  }

  /**
    * Gets ordered response for the query made to DLM
    * @param resources              resources as responded and aggregated from all beacon servers
    * @param queryStringPaginated   API query  made against all beacon server
    * @tparam T                     resource
    * @return
    */
  def getOrderedResponse[T <: AnyRef](resources: Seq[T], queryStringPaginated : Map[String, String]) : Seq[T] = {
    val sortOrder = queryStringPaginated.get(BeaconService.API_SORTORDER_KEY)
    val orderBy = queryStringPaginated.get(BeaconService.API_ORDERBY_KEY)

    orderBy match {
      case None => resources
      case Some(orderBy) => {
        val field = resources.head.getClass.getDeclaredField(orderBy)
        field.setAccessible(true)
        sortOrder match {
          case None => resources.sortWith(field.get(_).asInstanceOf[String] < field.get(_).asInstanceOf[String])
          case Some(sortOrder) => if (sortOrder == DESCEND.name) {
            resources.sortWith(field.get(_).asInstanceOf[String] > field.get(_).asInstanceOf[String])
          } else {
            resources.sortWith(field.get(_).asInstanceOf[String] < field.get(_).asInstanceOf[String])
          }
        }
      }
    }
  }

  /**
    * Get all policies for DLM enabled clusters
    * @param  queryString query parameters made with the `Get all policies api`
    * @return all policies across all dlm enabled clusters
    */
  def getAllPolicies(queryString : Map[String, String]): Future[Either[DlmApiErrors, PoliciesDetailsResponse]] = {
    val p: Promise[Either[DlmApiErrors, PoliciesDetailsResponse]] = Promise()
    dataplaneService.getBeaconClusters.map {
      case Left(errors) => p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None,
                                     Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
      case Right(beaconCluster) => {
        val originalPageLenth : Option[String] = queryString.get(BeaconService.API_PAGE_SIZE_KEY)
        val originalOffset : Int = queryString.getOrElse(BeaconService.API_OFFSET_KEY, BeaconService.API_OFFSET_DEFAULT_VALUE).toInt
        val queryStringPaginated = getQueryStringForResources(queryString, originalPageLenth, originalOffset)

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
              if (acc.exists(x => x.name == next.name && x.sourceCluster== next.sourceCluster && x.sourceCluster == next.sourceCluster)) acc
              else {
                next :: acc
              }
            }
          }.reverse.filter((policy) => { // filter policies on cluster set that are registered to dataplane
            beaconClusters.exists(x => x.name == policy.sourceCluster) && beaconClusters.exists(x => x.name == policy.targetCluster)
          })

          val policies : Seq[PolicyDetailsData] = getProcessedResponse(allPoliciesData, queryStringPaginated, originalPageLenth, originalOffset)
          val policiesDetails: Seq[PoliciesDetails] = policies.map(policy => {
            PoliciesDetails(policy.name, policy.`type`, policy.status, policy.sourceDataset, policy.targetDataset,
                            policy.frequencyInSec, policy.startTime, policy.endTime, policy.sourceCluster, policy.targetCluster)
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
    * @param clusterId    cluster id
    * @param policyName   policy name
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
    * @param policySubmitRequest posted data when submitting policy
    * @return
    */
  def createPolicy(clusterId: Long, policyName: String, policySubmitRequest: PolicySubmitRequest): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconService) => {
        val fullUrl = beaconService.fullURL
        val policyResponseFuture: Option[() => Future[Either[BeaconApiErrors, PostActionResponse]]] = Map(
          BeaconService.POLICY_SUBMIT -> { () => beaconPolicyService.submitPolicy(fullUrl, policyName, policySubmitRequest.policyDefinition) },
          BeaconService.POLICY_SUBMIT_SCHEDULE -> { () => beaconPolicyService.submitAndSchedulePolicy(fullUrl, policyName, policySubmitRequest.policyDefinition) }
        ).get(policySubmitRequest.submitType)

        policyResponseFuture match {
          case Some(policyFuture) => {
            policyFuture().map {
              case Left(errors) => p.success(Left(errors))
              case Right(createPolicyResponse) => p.success(Right(createPolicyResponse))
            }
          }
          case None => {
            val errorMsg: String =  BeaconService.submitTypeError(policySubmitRequest.submitType)
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
    * @param policyAction action to be executed on the policy
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
          case Right(policyInstanceService) => p.success(Right(PolicyInstancesResponse(policyInstanceService.totalResults, policyInstanceService.results, policyInstanceService.instance)))
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
          case Right(policyInstanceService) => p.success(Right(PolicyInstancesResponse(policyInstanceService.totalResults, policyInstanceService.results, policyInstanceService.instance)))
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
        val originalPageLenth : Option[String] = queryString.get(BeaconService.API_PAGE_SIZE_KEY)
        val originalOffset : Int = queryString.getOrElse(BeaconService.API_OFFSET_KEY,BeaconService.API_OFFSET_DEFAULT_VALUE).toInt
        val queryStringPaginated = getQueryStringForResources(queryString, originalPageLenth, originalOffset)

        Future.sequence(beaconUrls.map(beaconEventService.listEvents(_, queryStringPaginated))).map({
          eventListFromAllClusters => {
            val allEvents: Seq[BeaconEventResponse] = eventListFromAllClusters.filter(_.isRight).flatMap(_.right.get)
            val failedResponses: Seq[BeaconApiErrors] = eventListFromAllClusters.filter(_.isLeft).map(_.left.get)
            if (failedResponses.length == beaconUrls.length) {
              p.success(Left(DlmApiErrors(failedResponses)))
            } else {

              val events : Seq[BeaconEventResponse] = getProcessedResponse(allEvents, queryStringPaginated, originalPageLenth, originalOffset)
              p.success(Right(EventsDetailResponse(failedResponses, events)))
            }
          }
        })
    })
    p.future
  }
}

object BeaconService {
  lazy val API_PAGE_SIZE_KEY = "numResults"
  lazy val API_OFFSET_KEY = "offset"
  lazy val API_OFFSET_DEFAULT_VALUE = "0"
  lazy val API_SORTORDER_KEY = "sortOrder"
  lazy val API_ORDERBY_KEY = "orderBy"
  lazy val API_SORTORDER_DEFAULT_VALUE = "desc"
  lazy val POLICY_SUBMIT = "SUBMIT"
  lazy val POLICY_SUBMIT_SCHEDULE = "SUBMIT_AND_SCHEDULE"

  lazy val PAIR_CLUSTER_SIZE = 2


  def submitTypeError(submitType: String) : String = "Value passed submitType = " + submitType + " is invalid. Valid values for submitType are SUBMIT | SUBMIT_AND_SCHEDULE"
  def clusterPairPaylodError = "Request payload should be a set of two objects"
  def pairClusterError = "Error occurred while getting API response from DB service or/and Beacon service"

}

