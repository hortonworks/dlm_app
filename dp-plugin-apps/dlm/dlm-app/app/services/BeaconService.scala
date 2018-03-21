/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import com.google.inject.{Inject, Singleton}
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconAdminStatusDetails, BeaconApiError, BeaconApiErrors, BeaconEntityResponse, BeaconEventResponse, BeaconHdfsFileResponse, BeaconHiveDbResponse, BeaconHiveDbTablesResponse, BeaconLogResponse, CloudCredPostResponse, CloudCredResponse, CloudCredsBeaconResponse, CloudCredsResponse, PairedCluster, PolicyDataResponse, PostActionResponse, PoliciesDetailResponse => PolicyDetailsData}
import com.hortonworks.dlm.beacon.WebService._
import com.hortonworks.dlm.beacon.domain.RequestEntities.{CloudCredRequest, ClusterDefinitionRequest, PolicyTestRequest}
import models.AmazonS3Entities.{S3AccountCredential, S3AccountDetails}
import models.CloudAccountEntities.{CloudAccountWithCredentials, CloudAccountsBody}

import scala.concurrent.ExecutionContext.Implicits.global
import models.Entities.{CloudCredWithPolicies, UnpairClusterDefinition, _}
import models.PolicyAction
import models._
import play.api.http.Status.{BAD_REQUEST, INTERNAL_SERVER_ERROR}

import scala.collection.immutable.Set.Set2
import scala.concurrent.{Future, Promise}

/**
  * `BeaconService` class interacts with beacon rest APIs
  * @param beaconClusterService  beacon service to communicate with beacon cluster endpoints
  * @param beaconPairService beacon service to communicate with beacon pair endpoints
  * @param beaconPolicyService   beacon service to communicate with beacon policy endpoints
  * @param beaconPolicyInstanceService  beacon service to execute rest api on beacon policy instance resource
  * @param beaconEventService    beacon service to  get beacon events
  * @param beaconLogService      beacon service to get beacon logs
  * @param beaconAdminService    beacon service to get beacon plugin status
  * @param beaconBrowseService  beacon service to browse HDFS files and Hive databases
  * @param beaconCloudCredService  beacon service to get beacon cloud credentials
  * @param dataplaneService     dataplane service to interact with dataplane db service
  * @param ambariService        ambari client service
  * @param cloudServiceImpl     cloud interaction
  * @param dlmKeyStore          DLM keystore service
  */
@Singleton
class BeaconService @Inject()(
   @Named("beaconClusterService") val beaconClusterService: BeaconClusterService,
   @Named("beaconPairService") val beaconPairService: BeaconPairService,
   @Named("beaconPolicyService") val beaconPolicyService: BeaconPolicyService,
   @Named("beaconPolicyInstanceService") val beaconPolicyInstanceService: BeaconPolicyInstanceService,
   @Named("beaconEventService") val beaconEventService: BeaconEventService,
   @Named("beaconLogService") val beaconLogService: BeaconLogService,
   @Named("beaconAdminService") val beaconAdminService: BeaconAdminService,
   @Named("beaconBrowseService") val beaconBrowseService: BeaconBrowseService,
   @Named("beaconCloudCredService") val beaconCloudCredService: BeaconCloudCredService,
   val dataplaneService: DataplaneService,
   val ambariService: AmbariService,
   val cloudServiceImpl: CloudServiceImpl,
   val dlmKeyStore: DlmKeyStore) {



  def getClusterDetails(clusterEndpointId: Long, clusterId: Long)(implicit token:Option[HJwtToken]):
    Future[Either[DlmApiErrors, BeaconEntityResponse]] = {
    val p: Promise[Either[DlmApiErrors, BeaconEntityResponse]] = Promise()
    
    for {
      cluster <- dataplaneService.getCluster(clusterId)
      beaconUrl <- dataplaneService.getBeaconService(clusterEndpointId)
    } yield {
      if (!List(cluster, beaconUrl).exists(_.isLeft)) {
        dataplaneService.getDpCluster(cluster.right.get.dataplaneClusterId.get) map {
          case Left(errors) => p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None,
            Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
          case Right(dpCluster) =>
            val clusterName = dpCluster.dcName + "$" + cluster.right.get.name
            beaconClusterService.listCluster(beaconUrl.right.get, clusterEndpointId, clusterName).map({
              case Left(errors) => p.success(Left(DlmApiErrors(Seq(errors))))
              case Right(policyResponse) => p.success(Right(policyResponse))
            })
        }
      } else {
        p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None,
          Some(BeaconApiError(BeaconService.clusterDefError)))))))
      }
    }

    p.future
  }

  /**
    * Get list of all paired clusters
    *
    * @return PairedClustersResponse
    */
  def getAllPairedClusters()(implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors, PairedClustersResponse]] = {
    val p: Promise[Either[DlmApiErrors, PairedClustersResponse]] = Promise()
    dataplaneService.getBeaconClusters.map{
      case Left(errors) =>
        p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
      case Right(beaconCluster) =>
        val beaconClusters = beaconCluster.clusters
        val allPairedClusterFuture: Future[Seq[Either[BeaconApiErrors, Seq[PairedCluster]]]] =
          Future.sequence(beaconClusters.map((x) => beaconPairService.listPairedClusters(
            x.beaconUrl, x.id)))
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
            x.forall(clustername => beaconClusters.exists(x => x.dataCenter + "$" + x.name == clustername))
          }).map(clusterNamePair => {
            clusterNamePair.map(clusterName => beaconClusters.find(x => x.dataCenter + "$" + x.name == clusterName).get).asInstanceOf[Set2[BeaconCluster]]
          })

          val failedResponses: Seq[BeaconApiErrors] = allPairedClustersOption.filter(_.isLeft).map(_.left.get)
          if (beaconClusters.nonEmpty && failedResponses.lengthCompare(beaconClusters.length) == 0) {
            p.success(Left(DlmApiErrors(failedResponses)))
          } else {
            p.success(Right(PairedClustersResponse(failedResponses, setOfPairedClusters)))
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
  def pairClusters(clustersToBePaired: Set[PairClusterRequest]) (implicit token:Option[HJwtToken]) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()

    if (clustersToBePaired.size != BeaconService.PAIR_CLUSTER_SIZE) {
      val errorMsg: String = BeaconService.clusterPairPaylodError
      p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
    } else {
      val clustersToBePairedSeq = clustersToBePaired.toSeq
      val clusterAId = clustersToBePairedSeq.head.clusterId
      val clusterBId = clustersToBePairedSeq.tail.head.clusterId
      for {
        clusterA <- dataplaneService.getCluster(clusterAId)
        clusterB <- dataplaneService.getCluster(clusterBId)
        clusterAFs <- ambariService.getHDFSConfigDetails(clusterAId)
        clusterBFs <- ambariService.getHDFSConfigDetails(clusterBId)
        hiveServiceA <- ambariService.getHiveConfigDetails(clusterAId)
        hiveServiceB <- ambariService.getHiveConfigDetails(clusterBId)
        rangerServiceA <- ambariService.getRangerEndpointDetails(clusterAId)
        rangerServiceB <- ambariService.getRangerEndpointDetails(clusterBId)
        clusterDefinitionsA <- beaconPairService.listPairedClusters(clustersToBePairedSeq.head.beaconUrl, clusterAId)
        clusterDefinitionsB <- beaconPairService.listPairedClusters(clustersToBePairedSeq.tail.head.beaconUrl, clusterBId)
      } yield {
        val futureFailedList = List(clusterA, clusterB, clusterAFs, clusterBFs, hiveServiceA, hiveServiceB,
          rangerServiceA, rangerServiceB, clusterDefinitionsA, clusterDefinitionsB).filter(_.isLeft)
        if (futureFailedList.isEmpty) {
          for {
            dpClusterA <- dataplaneService.getDpCluster(clusterA.right.get.dataplaneClusterId.get)
            dpClusterB <- dataplaneService.getDpCluster(clusterB.right.get.dataplaneClusterId.get)
          } yield {
            if (!List(dpClusterA, dpClusterB).exists(_.isLeft)) {
              val listOfClusters = ClusterDefinitionDetails(clusterA.right.get, dpClusterA.right.get, clusterAFs.right.get, hiveServiceA.right.get, rangerServiceA.right.get, clusterDefinitionsA.right.get, clustersToBePairedSeq.head) ::
                ClusterDefinitionDetails(clusterB.right.get, dpClusterB.right.get, clusterBFs.right.get, hiveServiceB.right.get, rangerServiceB.right.get, clusterDefinitionsB.right.get, clustersToBePairedSeq.tail.head) :: Nil
              // Retrieve cluster definitions that is pending to be submitted to the beacon process
              val clusterDefsToBeSubmitted: Set[ClusterDefinition] = getClusterDefsToBeSubmitted(listOfClusters)
              if (clusterDefsToBeSubmitted.isEmpty) {
                createPair(listOfClusters, p)
              } else Future.sequence(clusterDefsToBeSubmitted.toSeq.map((x) => {
                val dataCenterClusterName =  x.clusterDefRequest.dataCenter + "$" + x.clusterDefRequest.name
                beaconClusterService.createClusterDefinition(x.beaconUrl, x.clusterId, dataCenterClusterName, x.clusterDefRequest)
              })).map({
                x => {
                  if (!x.exists(_.isLeft)) {
                    createPair(listOfClusters, p)
                  } else {
                    p.success(Left(x.find(_.isLeft).get.left.get))
                  }
                }
              })
            } else {
              failedCallBack(p)
            }
          }
        } else {
          failedCallBack(p)
        }
      }
    }

    def failedCallBack(p: Promise[Either[BeaconApiErrors, PostActionResponse]]) =  {
      val errorMsg: String = BeaconService.pairClusterError
      p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
    }

    p.future
  }

  /**
    * Get set of [[ClusterDefinition]] that needs to be submitted to beacon clusters
    * as a prerequisite before making actual 'pair clusters' beacon API call
    *
    * @param listOfClusters list of cluster definition details
    * @return set of [[ClusterDefinition]]
    */
  private def getClusterDefsToBeSubmitted(listOfClusters: List[ClusterDefinitionDetails]): Set[ClusterDefinition] = {
    val clusterNames: Seq[String] = listOfClusters.map(x => x.dpCluster.dcName + "$" + x.cluster.name)
    listOfClusters.foldLeft(Set(): Set[ClusterDefinition]) {
      (outerAcc, outerNext) => {
        val accumulateClusters: Set[ClusterDefinition] = clusterNames.foldLeft(Set(): Set[ClusterDefinition]) {
          (acc, nextClusterName) => {
            if (outerNext.clusterDefinitions.map(_.name).contains(nextClusterName)) acc else {
              val clusterToBePairedDetails: ClusterDefinitionDetails = listOfClusters.find(x => x.dpCluster.dcName + "$" + x.cluster.name == nextClusterName).get
              val local : Boolean =  (outerNext.dpCluster.dcName + "$" +  outerNext.cluster.name) == nextClusterName
              val nnService = clusterToBePairedDetails.nnClusterService
              val rangerService = clusterToBePairedDetails.rangerService
              val hiveServerConfigDetails: Map [String, Option[String]]= clusterToBePairedDetails.hiveServerService

              val clusterDefinition: ClusterDefinition = ClusterDefinition(
                outerNext.pairedClusterRequest.beaconUrl,
                outerNext.cluster.id.get,
                ClusterDefinitionRequest(
                  clusterToBePairedDetails.cluster.name,
                  clusterToBePairedDetails.dpCluster.dcName,
                  clusterToBePairedDetails.dpCluster.description,
                  local,
                  clusterToBePairedDetails.pairedClusterRequest.beaconUrl,
                  nnService,
                  rangerService,
                  hiveServerConfigDetails
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
  private def createPair(listOfClusters: List[ClusterDefinitionDetails],
                         p: Promise[Either[BeaconApiErrors, PostActionResponse]])(implicit token:Option[HJwtToken]) = {
    val remoteCluster = listOfClusters.tail.head
    val remoteClusterDcName = remoteCluster.dpCluster.dcName
    val remoteClusterName = remoteCluster.cluster.name
    val remoteDatacenterClusterName =  remoteClusterDcName + "$" + remoteClusterName
    beaconPairService.createClusterPair(listOfClusters.head.pairedClusterRequest.beaconUrl, listOfClusters.head.cluster.id.get,
      remoteDatacenterClusterName).map({
        case Left(beaconApiErrors) =>
          val beaconApiErrorMsg =  beaconApiErrors.error match {
            case Some(beaconApiError) => beaconApiError.message
            case None => ""
          }
          val clusterInfo =  listOfClusters.head
          val dcName = clusterInfo.dpCluster.dcName
          val clusterName = clusterInfo.cluster.name
          val message =  s"Beacon API to pair clusters $clusterName ($dcName) and $remoteClusterName ($remoteClusterDcName) " +
            s"failed: $beaconApiErrorMsg"

          p.success(Left(BeaconApiErrors(beaconApiErrors.code, beaconApiErrors.beaconUrl, Some(BeaconApiError(message)),
            beaconApiErrors.message)))
        case Right(clusterPairResponse) => p.success(Right(clusterPairResponse))
    })
  }

  /**
    * Unpairs passed set of clusters
    *
    * @param clustersToBeUnpaired Set of clusters to be unpaired
    * @return Future from promise
    */
  def unPairClusters(clustersToBeUnpaired: Set[PairClusterRequest])
                    (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    if (clustersToBeUnpaired.size != BeaconService.PAIR_CLUSTER_SIZE) {
      val errorMsg: String = BeaconService.clusterPairPaylodError
      p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
    } else {
      val clustersToBeUnpairedSeq = clustersToBeUnpaired.toSeq
      val clusterAId = clustersToBeUnpairedSeq.head.clusterId
      val clusterBId = clustersToBeUnpairedSeq.tail.head.clusterId
      val clusterABeaconUrl = clustersToBeUnpaired.head.beaconUrl
      val clusterBBeaconUrl = clustersToBeUnpaired.tail.head.beaconUrl

      for {
        clusterA <- dataplaneService.getCluster(clusterAId)
        clusterB <- dataplaneService.getCluster(clusterBId)
      } yield {
        val futureFailedList = List(clusterA, clusterB).filter(_.isLeft)
        if (futureFailedList.isEmpty) {
          for {
            dpClusterA <- dataplaneService.getDpCluster(clusterA.right.get.dataplaneClusterId.get)
            dpClusterB <- dataplaneService.getDpCluster(clusterB.right.get.dataplaneClusterId.get)
          } yield {
            val failedRequest = List(dpClusterA, dpClusterA).find(_.isLeft)
            if (failedRequest.isDefined) {
              val failedError = failedRequest.get.left.get.errors.head
              val failedErrorMsg = failedError.message
              val errorCode = failedError.status
              p.success(Left(BeaconApiErrors(errorCode, None, None, Some(failedErrorMsg))))
            } else {
              val dpClusterARightProj = dpClusterA.right.get
              val dpClusterBRightProj = dpClusterB.right.get
              val remoteDatacenterClusterName = dpClusterBRightProj.dcName + "$" + clusterB.right.get.name
              beaconPairService.createClusterUnpair(clustersToBeUnpairedSeq.head.beaconUrl, clusterAId, remoteDatacenterClusterName).map({
                case Left(beaconApiErrors) => p.success(Left(beaconApiErrors))
                case Right(clusterUnpairResponse) =>
                  for {
                    clusterDefinitionsA <- beaconPairService.listPairedClusters(clusterABeaconUrl, clusterAId)
                    clusterDefinitionsB <- beaconPairService.listPairedClusters(clusterBBeaconUrl, clusterBId)
                  } yield {
                    if (List(clusterDefinitionsA, clusterDefinitionsB).exists(_.isLeft)) {
                      val errorMsg: String = BeaconService.clusterDefError
                      p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(errorMsg)))))
                    } else {
                      val unpairClusterDefinitions : List[UnpairClusterDefinition] = UnpairClusterDefinition(dpClusterARightProj, clusterABeaconUrl, clusterAId, clusterDefinitionsA.right.get) ::
                        UnpairClusterDefinition(dpClusterBRightProj, clusterBBeaconUrl, clusterBId, clusterDefinitionsB.right.get) :: Nil
                      removeClusterDefinitions(unpairClusterDefinitions, clusterUnpairResponse).map({
                        case Left(beaconApiErrors) => p.success(Left(beaconApiErrors))
                        case Right(cur) => p.success(Right(cur))
                      })
                    }
                  }
              })
            }
          }
        } else {
          val failedErrorMsg = futureFailedList.head.left.get.errors.head.message
          val errorCode = futureFailedList.head.left.get.errors.head.status
          p.success(Left(BeaconApiErrors(errorCode, None, None, Some(failedErrorMsg))))
        }
      }
    }
    p.future
  }

  /**
    * Remove cluster definition from beacon server
    * @param unpairClusterDefinition cluster definitions for clusters being unpaired
    * @param clusterUnpairResponse  response received when unpair action succeeded
    * @param token   JWT token
    * @return
    */
  def removeClusterDefinitions(unpairClusterDefinition: List[UnpairClusterDefinition], clusterUnpairResponse: PostActionResponse)(implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()

    val clusterDefinitionToDelete : Set[UnpairClusterRequest] =  unpairClusterDefinition.foldLeft(Set(): Set[UnpairClusterRequest]) {
      (acc, next) => {
        acc union next.clusterDefinitions.filter(x => x.peers.isEmpty).map(x=>UnpairClusterRequest(next.beaconUrl, next.clusterId, x.name)).toSet
      }
    }

    Future.sequence(clusterDefinitionToDelete.toSeq.map((x) => {
      beaconClusterService.deleteClusterDefinition(x.beaconUrl, x.clusterId, x.clusterName)
    })).map({
      x => {
        if (!x.exists(_.isLeft)) {
          p.success(Right(clusterUnpairResponse))
        } else {
          p.success(Left(x.find(_.isLeft).get.left.get))
        }
      }
   })
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
      case Some(ob) =>
        val field = resources.head.getClass.getDeclaredField(ob)
        field.setAccessible(true)
        sortOrder match {
          case None => resources.sortWith(field.get(_).asInstanceOf[String] < field.get(_).asInstanceOf[String])
          case Some(so) => if (so == DESCEND.name) {
            resources.sortWith(field.get(_).asInstanceOf[String] > field.get(_).asInstanceOf[String])
          } else {
            resources.sortWith(field.get(_).asInstanceOf[String] < field.get(_).asInstanceOf[String])
          }
        }
    }
  }

  /**
    * Get all policies for DLM enabled clusters
    * @param  queryString query parameters made with the `Get all policies api`
    * @return all policies across all dlm enabled clusters
    */
  def getAllPolicies(queryString : Map[String, String])
                    (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors, PoliciesDetailsResponse]] = {
    val p: Promise[Either[DlmApiErrors, PoliciesDetailsResponse]] = Promise()
    dataplaneService.getBeaconClusters.map {
      case Left(errors) => p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None,
                                     Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
      case Right(beaconCluster) =>
        val originalPageLenth : Option[String] = queryString.get(BeaconService.API_PAGE_SIZE_KEY)
        val originalOffset : Int = queryString.getOrElse(BeaconService.API_OFFSET_KEY, BeaconService.API_OFFSET_DEFAULT_VALUE).toInt
        val queryStringPaginated = getQueryStringForResources(queryString, originalPageLenth, originalOffset)

        val beaconClusters = beaconCluster.clusters
        val allPoliciesFuture: Future[Seq[Either[BeaconApiErrors, Seq[PolicyDetailsData]]]] =
          Future.sequence(beaconClusters.map((x) => beaconPolicyService.listPolicies(
            x.beaconUrl, x.id, queryStringPaginated)))

        for {
          allPoliciesOption <- allPoliciesFuture
        } yield {
          val allPolicies: Seq[PolicyDetailsData] = allPoliciesOption.filter(_.isRight).flatMap(_.right.get)
          val allPoliciesData: List[PolicyDetailsData] = allPolicies.foldLeft(List(): List[PolicyDetailsData]) {
            (acc, next) => {
              val prev = acc.find(x => x.name == next.name && x.sourceCluster == next.sourceCluster && x.targetCluster == next.targetCluster)
              prev match {
                case None => next :: acc
                case Some(accPolicyInstance) =>
                  // Duplicate policies with empty job information should be filtered out
                  if (next.instances.isEmpty) acc
                  else  next :: acc.diff(List(accPolicyInstance))
              }
            }
          }.reverse.filter((policy) => { // filter policies on cluster set that are registered to dataplane
            val isSourceClusterRegisteredToDp = policy.sourceCluster match {
              case None => true
              case Some(sourceCluster) => beaconClusters.exists(x => x.dataCenter + "$" + x.name == sourceCluster)
            }
           val isTargetClusterRegisteredToDp = policy.targetCluster match {
              case None => true
              case Some(targetCluster) => beaconClusters.exists(x => x.dataCenter + "$" + x.name == targetCluster)
            }
            isSourceClusterRegisteredToDp && isTargetClusterRegisteredToDp
          })

          val policies : Seq[PolicyDetailsData] = getProcessedResponse(allPoliciesData, queryStringPaginated, originalPageLenth, originalOffset)
          val policiesDetails: Seq[PoliciesDetails] = policies.map(policy => {
            PoliciesDetails(policy.policyId, policy.name, policy.description, policy.`type`, policy.executionType,
                            policy.status, policy.sourceDataset, policy.targetDataset, policy.frequencyInSec,
                            policy.startTime, policy.endTime, policy.sourceCluster, policy.targetCluster,
                            policy.customProperties, policy.instances, policy.report)
          })

          val failedResponses: Seq[BeaconApiErrors] = allPoliciesOption.filter(_.isLeft).map(_.left.get)
          if (beaconClusters.nonEmpty && failedResponses.lengthCompare(beaconClusters.length) == 0) {
            p.success(Left(DlmApiErrors(failedResponses)))
          } else {
            p.success(Right(PoliciesDetailsResponse(failedResponses, policiesDetails)))
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
  def getPolicy(clusterId: Long, policyName: String)
               (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyDataResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PolicyDataResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconPolicyService.listPolicy(beaconUrl, clusterId, policyName).map({
          case Left(errors) => p.success(Left(errors))
          case Right(policyResponse) => p.success(Right(policyResponse))
        })
    }
    p.future
  }

  /**
    * Create policy between paired clusters
    *
    * @param policySubmitRequest posted data when submitting policy
    * @return
    */
  def createPolicy(clusterId: Long, policyName: String, policySubmitRequest: PolicySubmitRequest)
                  (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        policySubmitRequest.policyDefinition.cloudCred match {
          case None =>
            // on prem to on prem replication
            beaconPolicyService.submitAndSchedulePolicy(beaconUrl, clusterId, policyName, policySubmitRequest.policyDefinition).map {
              case Left(errors) => p.success(Left(errors))
              case Right(createPolicyResponse) => p.success(Right(createPolicyResponse))
            }
          case Some(cloudCredName) =>
            // DLM - 1.1 cluster with cloud replication

            getCloudCredByName(clusterId, cloudCredName) map {
              case Left(errors) => p.success(Left(errors))
              case Right(cloudCredResponse) =>
                checkAndCreateClusterDefinition(clusterId, beaconUrl).map {
                  case Right(result) =>
                    if (cloudCredResponse.isEmpty) {
                      dlmKeyStore.getCloudAccount(cloudCredName) map {
                        case Right(cloudAccount) =>
                          CloudAccountProvider.withName(cloudAccount.accountDetails.provider) match {
                            case CloudAccountProvider.AWS =>
                              val accountCredentials = cloudAccount.accountCredentials.asInstanceOf[S3AccountCredential]
                              val accountDetails = cloudAccount.accountDetails.asInstanceOf[S3AccountDetails]
                              val credentialType = cloudAccount.accountCredentials.credentialType
                              val cloudCredRequest = CloudCredRequest(cloudCredName, cloudAccount.version.get,
                                accountDetails.provider, credentialType, accountCredentials.accessKeyId, accountCredentials.secretAccessKey)
                              createCloudCred(clusterId, cloudCredRequest) map  {
                                case Left(errors) => p.success(Left(errors))
                                case Right(cloudCredPostResponse) =>
                                  val policyDefinition = policySubmitRequest.policyDefinition.copy(cloudCred = Some(cloudCredPostResponse.entityId))
                                  beaconPolicyService.submitAndSchedulePolicy(beaconUrl, clusterId, policyName, policyDefinition).map {
                                    case Left(errors) => p.success(Left(errors))
                                    case Right(createPolicyResponse) => p.success(Right(createPolicyResponse))
                                  }
                              }
                            case CloudAccountProvider.WASB =>
                              p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some("Creating policy with WASB credentials not supported")))) // @TODO: Update all beacon clusters having WASB credentials
                            case CloudAccountProvider.ADLS =>
                              p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some("Creating policy with ADLS credentials not supported")))) // @TODO: Update all beacon clusters having ADLS credentials
                          }
                        case Left(error) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some(error.message))))
                      }
                    } else {
                      // Cloud credential exists on the cluster
                      val policyDefinition = policySubmitRequest.policyDefinition.copy(cloudCred = Some(cloudCredResponse.head.id))
                      beaconPolicyService.submitAndSchedulePolicy(beaconUrl, clusterId, policyName, policyDefinition).map {
                        case Left(errors) => p.success(Left(errors))
                        case Right(createPolicyResponse) => p.success(Right(createPolicyResponse))
                      }
                    }
                  case Left(errors) => p.success(Left(errors))
                }
          }
        }
    }
    p.future
  }

  /**
    * Test Policy
    *
    * @param policyTestRequest payload data when testing policy
    * @return
    */
  def testPolicy(clusterId: Long, policyTestRequest: PolicyTestRequest)
                (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        val cloudCredName = policyTestRequest.cloudCred
        getCloudCredByName(clusterId, cloudCredName) map {
          case Left(errors) => p.success(Left(errors))
          case Right(cloudCredResponse) =>
            checkAndCreateClusterDefinition(clusterId, beaconUrl).map {
              case Right(result) =>
                if (cloudCredResponse.isEmpty) {
                  dlmKeyStore.getCloudAccount(cloudCredName) map {
                    case Right(cloudAccount) =>
                      CloudAccountProvider.withName(cloudAccount.accountDetails.provider) match {
                        case CloudAccountProvider.AWS =>
                          val accountCredentials = cloudAccount.accountCredentials.asInstanceOf[S3AccountCredential]
                          val accountDetails = cloudAccount.accountDetails.asInstanceOf[S3AccountDetails]
                          val credentialType = cloudAccount.accountCredentials.credentialType
                          val cloudCredRequest = CloudCredRequest(cloudCredName, cloudAccount.version.get, accountDetails.provider,
                            credentialType, accountCredentials.accessKeyId, accountCredentials.secretAccessKey)
                          createCloudCred(clusterId, cloudCredRequest) map  {
                            case Left(errors) => p.success(Left(errors))
                            case Right(cloudCredPostResponse) =>
                              val policyTestDefinition = policyTestRequest.copy(cloudCred = cloudCredPostResponse.entityId)
                              beaconPolicyService.testPolicy(beaconUrl, clusterId, policyTestDefinition).map {
                                case Left(errors) => p.success(Left(errors))
                                case Right(testPolicyResponse) => p.success(Right(testPolicyResponse))
                              }
                          }
                        case CloudAccountProvider.WASB =>
                          p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some("Testing policy with WASB credentials not supported"))))
                        case CloudAccountProvider.ADLS =>
                          p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some("Testing policy with ADLS credentials not supported")))) 
                      }
                    case Left(error) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some(error.message))))
                  }
                } else {
                  // Cloud credential exists on the cluster
                  val policyTestDefinition = policyTestRequest.copy(cloudCred = cloudCredResponse.head.id)
                  beaconPolicyService.testPolicy(beaconUrl, clusterId, policyTestDefinition).map {
                    case Left(errors) => p.success(Left(errors))
                    case Right(testPolicyResponse) => p.success(Right(testPolicyResponse))
                  }
                }
              case Left(errors) => p.success(Left(errors))
            }
        }

    }
    p.future
  }

  /**
    * Check if the local cluster definition present and if not then create it for the cluster
    * @param clusterId
    * @param beaconUrl
    * @param token
    * @return
    */
  def checkAndCreateClusterDefinition(clusterId: Long, beaconUrl: String)(implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Unit]] = {
    val p: Promise[Either[BeaconApiErrors, Unit]] = Promise()
    isLocalClusterDefSubmitted(clusterId, beaconUrl).map {
      case Right(result) =>
        result match {
          case None => p.success(Right(Unit))
          case Some(clusterDetails) =>
            for {
              clusterFs <- ambariService.getHDFSConfigDetails(clusterId)
              hiveService <- ambariService.getHiveConfigDetails(clusterId)
              rangerService <- ambariService.getRangerEndpointDetails(clusterId)
            } yield {
              val futureFailedList = List(clusterFs, hiveService, rangerService).filter(_.isLeft)
              if (futureFailedList.isEmpty) {
                val name = clusterDetails.cluster.name
                val dcName = clusterDetails.dpCluster.dcName
                val description = clusterDetails.dpCluster.description
                val clusterName = dcName + "$" + name
                val local = true
                val clusterFsValue = clusterFs.right.get
                val rangerServiceValue = rangerService.right.get
                val hiveServiceValue = hiveService.right.get
                val clusterDefRequest = ClusterDefinitionRequest(name, dcName, description,
                  local, beaconUrl, clusterFsValue, rangerServiceValue, hiveServiceValue)

                beaconClusterService.createClusterDefinition(beaconUrl, clusterId, clusterName, clusterDefRequest).map {
                  case Right(result) => {
                    p.success(Right(Unit))
                  }
                  case Left(errors) => {
                    p.success(Left(errors))
                  }
                }

              } else {
                val failedApi = futureFailedList.find(_.isLeft)
                val errors = failedApi.get.left.get.errors
                p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.map(x => BeaconApiError(x.message)).head))))
              }
            }
        }

      case Left (errors) => p.success(Left(errors))
    }
    p.future
  }

  /**
    * Check if the cluster has the local definition submitted
    * @param clusterId
    * @param beaconUrl
    * @param token
    * @return
    */
  def isLocalClusterDefSubmitted(clusterId: Long, beaconUrl: String)(implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Option[ClusterDetails]]] = {
    val p: Promise[Either[BeaconApiErrors, Option[ClusterDetails]]] = Promise()
    dataplaneService.getCluster(clusterId).map {
      case Right(cluster) => dataplaneService.getDpCluster(cluster.dataplaneClusterId.get) map {
        case Right(dpCluster) =>
          val clusterName = dpCluster.dcName + "$" + cluster.name
          beaconPairService.listPairedClusters(beaconUrl, clusterId).map {
            case Right(pairedClusters) =>
              if (pairedClusters.exists(x => x.name == clusterName)) {
                p.success(Right(None))
              } else {
                p.success(Right(Some(ClusterDetails(cluster, dpCluster))))
              }

            case Left (errors) => p.success(Left(errors))
          }
        case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      }
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
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
  def updatePolicy(clusterId: Long, policyName: String, policyAction: PolicyAction)
                  (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        val policyActionResponseFuture: Future[Either[BeaconApiErrors, PostActionResponse]] = policyAction match {
          case SUSPEND => beaconPolicyService.suspendPolicy(beaconUrl, clusterId, policyName)
          case RESUME => beaconPolicyService.resumePolicy(beaconUrl, clusterId, policyName)
          case DELETE => beaconPolicyService.deletePolicy(beaconUrl, clusterId, policyName)
        }

        policyActionResponseFuture.map {
          case Left(errors) => p.success(Left(errors))
          case Right(policyActionResponse) => p.success(Right(policyActionResponse))
        }
    }
    p.future
  }

  def getPolicyInstances(clusterId: Long, policyName: String, queryString: Map[String, String])
                        (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyInstancesResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PolicyInstancesResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconPolicyInstanceService.listPolicyInstance(beaconUrl, clusterId, policyName, queryString).map {
          case Left(errors) => p.success(Left(errors))
          case Right(policyInstanceService) => p.success(Right(PolicyInstancesResponse(policyInstanceService.totalResults, policyInstanceService.results, policyInstanceService.instance)))
        }
    }
    p.future
  }

  def getPolicyInstancesForCluster(clusterId: Long, queryString: Map[String, String])
                                  (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyInstancesResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PolicyInstancesResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconPolicyInstanceService.listPolicyInstances(beaconUrl, clusterId, queryString).map {
          case Left(errors) => p.success(Left(errors))
          case Right(policyInstanceService) => p.success(Right(PolicyInstancesResponse(policyInstanceService.totalResults, policyInstanceService.results, policyInstanceService.instance)))
        }
    }
    p.future
  }

  def abortPolicyInstancesOnCluster(clusterId: Long, policyName: String)
                                   (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconPolicyInstanceService.abortPolicyInstances(beaconUrl, clusterId, policyName).map {
          case Left(errors) => p.success(Left(errors))
          case Right(response) => p.success(Right(response))
        }
    }
    p.future
  }

  /**
    *  Rerun last instance of the policy
    * @param clusterId  target cluster id
    * @param policyName  policy name whose last job is to be rerun
    * @param token  JWT token
    * @return
    */
  def rerunLastPolicyInstance(clusterId: Long, policyName: String)
                                   (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val p: Promise[Either[BeaconApiErrors, PostActionResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconPolicyInstanceService.rerunPolicyInstance(beaconUrl, clusterId, policyName).map {
          case Left(errors) => p.success(Left(errors))
          case Right(response) => p.success(Right(response))
        }
    }
    p.future
  }


  def getAllEvents(queryString: Map[String, String])
                  (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors, EventsDetailResponse]] = {
    val p: Promise[Either[DlmApiErrors, EventsDetailResponse]] = Promise()
    dataplaneService.getClusterIdWithBeaconUrls.map ({
      case Left(errors) => p.success(Left(DlmApiErrors(errors.errors.map(x => BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(BeaconApiError(x.message)))))))
      case Right(clusterIdWithBeaconUrl) =>
        val originalPageLenth : Option[String] = queryString.get(BeaconService.API_PAGE_SIZE_KEY)
        val originalOffset : Int = queryString.getOrElse(BeaconService.API_OFFSET_KEY,BeaconService.API_OFFSET_DEFAULT_VALUE).toInt
        val queryStringPaginated = getQueryStringForResources(queryString, originalPageLenth, originalOffset)

        Future.sequence(clusterIdWithBeaconUrl.map( x => beaconEventService.listEvents(x.beaconUrl, x.clusterId, queryStringPaginated))).map({
          eventListFromAllClusters => {
            val allEvents: Seq[BeaconEventResponse] = eventListFromAllClusters.filter(_.isRight).flatMap(_.right.get).
              filter(x => x.syncEvent.isEmpty || (x.syncEvent.isDefined && !x.syncEvent.get))
            val failedResponses: Seq[BeaconApiErrors] = eventListFromAllClusters.filter(_.isLeft).map(_.left.get)
            if (clusterIdWithBeaconUrl.nonEmpty && failedResponses.lengthCompare(clusterIdWithBeaconUrl.length) == 0) {
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

  def getBeaconLogs(clusterId: Long, queryString: Map[String, String]) (implicit token:Option[HJwtToken]) : Future[Either[BeaconApiErrors, BeaconLogResponse]] = {
    val p: Promise[Either[BeaconApiErrors, BeaconLogResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconLogService.listLog(beaconUrl, clusterId, queryString).map {
          case Left(errors) => p.success(Left(errors))
          case Right(beaconLogResponse) => p.success(Right(beaconLogResponse))
        }
    }
    p.future
  }

  /**
    * Return beacon admin status for all registered beacon servers
    * @param token  JWT token
    * @return
    */
  def getAllBeaconAdminStatus() (implicit token:Option[HJwtToken]) : Future[Either[DlmApiErrors, AdminStatusResponse]] = {
    val p: Promise[Either[DlmApiErrors, AdminStatusResponse]] = Promise()
    dataplaneService.getBeaconClusters.map {
      case Left(errors) => p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None,
        Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
      case Right(beaconCluster) =>
        val beaconClusters = beaconCluster.clusters
        val allBeaconAdminStatusFuture: Future[Seq[Either[BeaconApiErrors, BeaconAdminStatusDetails]]] =
          Future.sequence(beaconClusters.map((x) => beaconAdminService.listStatus(x.beaconUrl, x.id)))

        for {
          allBeaconAdminStatusFuture <- allBeaconAdminStatusFuture
        } yield {
          val allBeaconAdminStatus: Seq[BeaconAdminStatusDetails] = allBeaconAdminStatusFuture.filter(_.isRight).map(x => x.right.get)
          val failedResponses: Seq[BeaconApiErrors] = allBeaconAdminStatusFuture.filter(_.isLeft).map(_.left.get)
          if (beaconClusters.nonEmpty && failedResponses.lengthCompare(beaconClusters.length) == 0) {
            p.success(Left(DlmApiErrors(failedResponses)))
          } else {
            p.success(Right(AdminStatusResponse(failedResponses, allBeaconAdminStatus)))
          }
        }
    }
    p.future
  }

  /**
    * Get listStatus for HDFS file path found in the query
    * @param clusterId    cluster id
    * @param queryString  query parameters with `path` parameter
    * @return
    */
  def getListHdfsFileResponse(clusterId: Long, queryString: Map[String, String])(implicit token:Option[HJwtToken]) :
    Future[Either[BeaconApiErrors, BeaconHdfsFileResponse]] = {
    val p: Promise[Either[BeaconApiErrors, BeaconHdfsFileResponse]] = Promise()
    val filePath = queryString.get(BeaconService.QUERY_PARAM_FILEPATH_KEY)
    filePath match {
      case Some(path) =>
        dataplaneService.getBeaconService(clusterId).map {
          case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
          case Right(beaconUrl) =>
            beaconBrowseService.listHdfsFile(beaconUrl, clusterId, Map("path" -> path)).map {
              case Left(errors) => p.success(Left(errors))
              case Right(beaconHdfsFileResponse) => p.success(Right(beaconHdfsFileResponse))
            }
        }
      case None => p.success(Left(BeaconApiErrors(BAD_REQUEST, None, Some(BeaconApiError(BeaconService.pathErrorMsg)))))
    }

    p.future

  }

  /**
    * Get list of hive databases via beacon Api
    * @param clusterId cluster id
    * @return
    */
  def getHiveDatabases(clusterId: Long)(implicit token:Option[HJwtToken]) : Future[Either[BeaconApiErrors, BeaconHiveDbResponse]] = {
    val p: Promise[Either[BeaconApiErrors, BeaconHiveDbResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconBrowseService.listHiveDb(beaconUrl, clusterId).map {
          case Left(errors) => p.success(Left(errors))
          case Right(beaconHiveDbResponse) => p.success(Right(beaconHiveDbResponse))
        }
    }
    p.future
  }

  /**
    * Get all tables for hive database using auto hive20 instance REST APIs
    * @param clusterId cluster id
    * @return
    */
  def getHiveDatabaseTables(clusterId: Long, dbName: String)(implicit token:Option[HJwtToken]) : Future[Either[BeaconApiErrors, BeaconHiveDbTablesResponse]] = {
    val p: Promise[Either[BeaconApiErrors, BeaconHiveDbTablesResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconBrowseService.listHiveDbTables(beaconUrl, clusterId, dbName).map {
          case Left(errors) => p.success(Left(errors))
          case Right(beaconHiveDbTableResponse) => p.success(Right(beaconHiveDbTableResponse))
        }
    }
    p.future
  }

  /**
    * Create cloud credential for a beacon cluster
    * @param clusterId
    * @param cloudCredRequest
    * @param token
    * @return
    */
  def createCloudCred(clusterId: Long, cloudCredRequest : CloudCredRequest)
                      (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, CloudCredPostResponse]] = {
    val p: Promise[Either[BeaconApiErrors, CloudCredPostResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconCloudCredService.createCloudCred(beaconUrl, clusterId, cloudCredRequest).map({
          case Left(errors) => p.success(Left(errors))
          case Right(cloudCredResponse) => p.success(Right(cloudCredResponse))
        })
    }


    p.future
  }

  /**
    * Update cloud credential in the keystore and in all existing beacon clusters
    * @param cloudAccount
    * @param token
    * @return
    */
  def updateDlmStoreAndCloudCreds(cloudAccount: CloudAccountWithCredentials)
                      (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors,DlmApiErrors]] = {
    val p: Promise[Either[DlmApiErrors,DlmApiErrors]] = Promise()
    dlmKeyStore.updateCloudAccount(cloudAccount) map {
      case Right(versionedCloudAccount) =>
        updateBeaconCloudCred(versionedCloudAccount).map {
          dlmApiErrors => p.success(Right(dlmApiErrors))
        }
      case Left(error) =>  p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some(error.message))))))
    }
    p.future
  }

  def syncCloudCred(cloudAccountId: String)
                                 (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors,DlmApiErrors]] = {
    val p: Promise[Either[DlmApiErrors,DlmApiErrors]] = Promise()
    dlmKeyStore.getCloudAccount(cloudAccountId) map {
      case Right(versionedCloudAccount) =>
        updateBeaconCloudCred(versionedCloudAccount).map {
          dlmApiErrors => p.success(Right(dlmApiErrors))
        }
      case Left(error) =>  p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some(error.message))))))
    }
    p.future
  }

  /**
    * Update cloud credential in the keystore and in all existing beacon clusters
    * @param cloudAccount
    * @param token
    * @return
    */
  def updateBeaconCloudCred(cloudAccount: CloudAccountWithCredentials)
                      (implicit token:Option[HJwtToken]): Future[DlmApiErrors] = {
    val p: Promise[DlmApiErrors] = Promise()
    val queryString = Map(("numResults","200"))
    getAllCloudCreds(queryString).map {
      case Left(errors) =>  p.success(errors)
      case Right(cloudCredsDetailResponse) =>
        val filteredCloudCreds = cloudCredsDetailResponse.allCloudCreds.filter(x => x.cloudCreds.cloudCred.exists(item => item.name == cloudAccount.id))
        if (filteredCloudCreds.isEmpty) {
          p.success(DlmApiErrors(cloudCredsDetailResponse.unreachableBeacon))
        } else {
          CloudAccountProvider.withName(cloudAccount.accountDetails.provider) match {
            case CloudAccountProvider.AWS =>
              val accountCredentials = cloudAccount.accountCredentials.asInstanceOf[S3AccountCredential]
              val accountDetails = cloudAccount.accountDetails.asInstanceOf[S3AccountDetails]
              val credentialType = cloudAccount.accountCredentials.credentialType
              val cloudCredRequest = CloudCredRequest(cloudAccount.id, cloudAccount.version.get, accountDetails.provider, credentialType,
                accountCredentials.accessKeyId, accountCredentials.secretAccessKey)
              Future.sequence(filteredCloudCreds.map(x => {
                val cloudCredToUpdate = x.cloudCreds.cloudCred.find(item => item.name == cloudAccount.id)
                beaconCloudCredService.updateCloudCred(x.beaconUrl, x.clusterId, cloudCredToUpdate.get.id, cloudCredRequest)
              })).map({
                cloudCredUpdateResponse => {
                  val failedResponses: Seq[BeaconApiErrors] = cloudCredUpdateResponse.filter(_.isLeft).map(_.left.get)
                  p.success(DlmApiErrors(failedResponses ++ cloudCredsDetailResponse.unreachableBeacon))
                }
              })
            case CloudAccountProvider.WASB =>
              p.success(DlmApiErrors(Seq())) // @TODO: Update all beacon clusters having this WASB credentials
            case CloudAccountProvider.ADLS =>
              p.success(DlmApiErrors(Seq())) // @TODO: Update all beacon clusters having this ADLS credentials
          }

        }
    }
    p.future
  }


  /**
    * Delete cloud credential from all existing beacon clusters and then from keystore
    * @param cloudCredName
    * @param token
    * @return
    */
  def deleteCloudCreds(cloudCredName: String)
                      (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors,DlmApiErrors]] = {
    val p: Promise[Either[DlmApiErrors,DlmApiErrors]] = Promise()
    val queryString = Map(("numResults","200"))
    getAllCloudCreds(queryString).map {
      case Left(errors) =>  p.success(Left(errors))
      case Right(cloudCredsDetailResponse) =>
        dlmKeyStore.deleteCloudAccount(cloudCredName) map {
          case Left(errors) => p.success(Left(errors))
          case Right(result) => {
            val filteredCloudCreds = cloudCredsDetailResponse.allCloudCreds.filter(x => x.cloudCreds.cloudCred.exists(item => item.name == cloudCredName))
            if (filteredCloudCreds.isEmpty) {
              p.success(Right(DlmApiErrors(cloudCredsDetailResponse.unreachableBeacon)))
            } else {
              Future.sequence(filteredCloudCreds.map(x => {
                beaconCloudCredService.deleteCloudCred(x.beaconUrl, x.clusterId, x.cloudCreds.cloudCred.head.id)
              })).map({
                cloudCredUpdateResponse => {
                  val failedResponses: Seq[BeaconApiErrors] = cloudCredUpdateResponse.filter(_.isLeft).map(_.left.get)
                  p.success(Right(DlmApiErrors(failedResponses ++ cloudCredsDetailResponse.unreachableBeacon)))
                }
              })
            }
          }
        }
    }
    p.future
  }

  /**
    * Delete cloud credential from all existing beacon clusters
    * @param cloudCredName
    * @param token
    * @return
    */
  def deleteBeaconCredential(cloudCredName: String)
                      (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors,DlmApiErrors]] = {
    val p: Promise[Either[DlmApiErrors,DlmApiErrors]] = Promise()
    val queryString = Map(("numResults","200"))
    getAllCloudCreds(queryString).map {
      case Left(errors) =>  p.success(Left(errors))
      case Right(cloudCredsDetailResponse) =>
        val filteredCloudCreds = cloudCredsDetailResponse.allCloudCreds.filter(x => x.cloudCreds.cloudCred.exists(item => item.name == cloudCredName))
        if (filteredCloudCreds.isEmpty) {
          p.success(Right(DlmApiErrors(cloudCredsDetailResponse.unreachableBeacon)))
        } else {
          Future.sequence(filteredCloudCreds.map(x => {
            beaconCloudCredService.deleteCloudCred(x.beaconUrl, x.clusterId, x.cloudCreds.cloudCred.head.id)
          })).map({
            cloudCredUpdateResponse => {
              val failedResponses: Seq[BeaconApiErrors] = cloudCredUpdateResponse.filter(_.isLeft).map(_.left.get)
              p.success(Right(DlmApiErrors(failedResponses ++ cloudCredsDetailResponse.unreachableBeacon)))
            }
          })
        }
    }
    p.future
  }


  /**
    * Get cloud credentials from all beacon clusters
    * @param queryString
    * @param token
    * @return
    */
  def getAllCloudCreds(queryString: Map[String, String])
                  (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors, CloudCredsDetailResponse]] = {
    val p: Promise[Either[DlmApiErrors, CloudCredsDetailResponse]] = Promise()
    getAllBeaconAdminStatus().map ({
      case Left(errors) => p.success(Left(errors))
      case Right(adminStatusResponse) =>
        val originalPageLenth : Option[String] = queryString.get(BeaconService.API_PAGE_SIZE_KEY)
        val originalOffset : Int = queryString.getOrElse(BeaconService.API_OFFSET_KEY,BeaconService.API_OFFSET_DEFAULT_VALUE).toInt
        val queryStringPaginated = getQueryStringForResources(queryString, originalPageLenth, originalOffset)
        val clustersWithCloudSupport : Seq[BeaconAdminStatusDetails] = adminStatusResponse.response.filter(x => x.beaconAdminStatus.replication_cloud_fs.isDefined)
        Future.sequence(clustersWithCloudSupport.map( x => beaconCloudCredService.listAllCloudCred(x.beaconEndpoint, x.clusterId, queryStringPaginated))).map({
          cloudCredListFromAllClusters => {
            val allCloudCreds: Seq[CloudCredsBeaconResponse] = cloudCredListFromAllClusters.filter(_.isRight).map(_.right.get)
            val failedResponses: Seq[BeaconApiErrors] = cloudCredListFromAllClusters.filter(_.isLeft).map(_.left.get)
            if (clustersWithCloudSupport.nonEmpty && failedResponses.lengthCompare(clustersWithCloudSupport.length) == 0) {
              p.success(Left(DlmApiErrors(failedResponses ++ adminStatusResponse.unreachableBeacon)))
            } else {
              p.success(Right(CloudCredsDetailResponse(failedResponses, allCloudCreds)))
            }
          }
        })
    })
    p.future
  }

  /**
    * Get cloud credentials from all beacon clusters
    * @param queryString
    * @param token
    * @return
    */
  def getAllCloudCredsWithPolicies(queryString: Map[String, String])
                      (implicit token:Option[HJwtToken]): Future[Either[DlmApiErrors, CloudCredWithPoliciesResponse]] = {
    val p: Promise[Either[DlmApiErrors, CloudCredWithPoliciesResponse]] = Promise()
    dlmKeyStore.getAllCloudAccountNames.map {
      case Left(error) => p.success(Left(DlmApiErrors(List(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some(error.message))))))
      case Right(cloudAccounts) =>
        getAllBeaconAdminStatus().map ({
          case Left(errors) => p.success(Left(errors))
          case Right(adminStatusResponse) =>
            val originalPageLenth : Option[String] = queryString.get(BeaconService.API_PAGE_SIZE_KEY)
            val originalOffset : Int = queryString.getOrElse(BeaconService.API_OFFSET_KEY,BeaconService.API_OFFSET_DEFAULT_VALUE).toInt
            val queryStringPaginated = getQueryStringForResources(queryString, originalPageLenth, originalOffset)
            val clustersWithCloudSupport : Seq[BeaconAdminStatusDetails] = adminStatusResponse.response.filter(x => x.beaconAdminStatus.replication_cloud_fs.isDefined)
            Future.sequence(clustersWithCloudSupport.map(
              x => {
                for {
                  cloudCredList <- beaconCloudCredService.listAllCloudCred(x.beaconEndpoint, x.clusterId, queryStringPaginated)
                  policies <- beaconPolicyService.listPolicies(x.beaconEndpoint, x.clusterId, queryStringPaginated)
                } yield {
                  CloudCredPoliciesEither(cloudCredList, policies)
                }
              }
            )).map({
              cloudCredListFromAllClusters => {
                val allCloudCreds : Seq[CloudCredPolicies] = cloudCredListFromAllClusters.filter(x => x.cloudCred.isRight && x.policies.isRight).map(
                  x => {
                    val policiesDetails: Seq[PoliciesDetails] = x.policies.right.get.map(policy => {
                      PoliciesDetails(policy.policyId, policy.name, policy.description, policy.`type`, policy.executionType,
                        policy.status, policy.sourceDataset, policy.targetDataset, policy.frequencyInSec,
                        policy.startTime, policy.endTime, policy.sourceCluster, policy.targetCluster,
                        policy.customProperties, policy.instances, policy.report)
                    })
                    CloudCredPolicies(x.cloudCred.right.get, policiesDetails)
                  }
                )

                val failedResponses: Seq[BeaconApiErrors] = cloudCredListFromAllClusters.filter(x => x.cloudCred.isLeft || x.policies.isLeft)
                  .map(x => if (x.cloudCred.isLeft) x.cloudCred.left.get else x.policies.left.get)
                if (clustersWithCloudSupport.nonEmpty && failedResponses.lengthCompare(clustersWithCloudSupport.length) == 0) {
                  p.success(Left(DlmApiErrors(failedResponses ++ adminStatusResponse.unreachableBeacon)))
                } else {
                  val allCloudCredentials: Seq[CloudCredWithPolicies] = allCloudCreds.foldLeft(List(): List[CloudCredWithPolicies]) {
                    (acc, next) => {
                      val policies = next.policies
                      val cloudCredsInCluster = next.cloudCred.cloudCreds.cloudCred
                      val clusterId = next.cloudCred.clusterId
                      var newAcc : List[CloudCredWithPolicies] = acc
                      val cloudCredsInClusterWithNoPolicies = cloudCredsInCluster.filterNot(x =>
                        policies.exists(policy =>
                          policy.customProperties.exists(properties => properties.get("cloudCred").contains(x.id))
                        )
                      )
                      val isInSync = false
                      for (nextCloudCredInCluster <- cloudCredsInClusterWithNoPolicies) {
                        val cloudCredName = nextCloudCredInCluster.name
                        val clusterCred = getClusterCred(cloudAccounts, clusterId, cloudCredName, nextCloudCredInCluster)
                        val cloudCredWithSameName = acc.find(x => x.name == cloudCredName)
                        newAcc = cloudCredWithSameName match {
                          case None =>
                            acc :+ CloudCredWithPolicies(cloudCredName, List(), List(clusterCred), Some(nextCloudCredInCluster))
                          case Some(cloudCredWithPolicies) =>
                            val index = acc.indexOf(cloudCredWithPolicies)
                            val updatedPoliciesList = cloudCredWithPolicies.policies
                            val updatedClusterList = cloudCredWithPolicies.clusters :+ clusterCred
                            acc.updated(index, CloudCredWithPolicies(cloudCredWithPolicies.name, updatedPoliciesList, updatedClusterList, cloudCredWithPolicies.cloudCred))
                        }
                      }

                      for (nextPolicyInCluster <- policies) {
                        newAcc = nextPolicyInCluster.customProperties match {
                          case None => newAcc
                          case Some(customProperties) =>
                            customProperties.get("cloudCred") match {
                              case None => newAcc
                              case Some(cloudCredId) =>
                                val cloudCred = cloudCredsInCluster.find(x => x.id == cloudCredId)
                                cloudCred match {
                                  case None => newAcc
                                  case Some(cloudCredResponse) =>
                                    val cloudCredName = cloudCredResponse.name
                                    val clusterCred = getClusterCred(cloudAccounts, clusterId, cloudCredName, cloudCredResponse)
                                    val cloudCredWithSameName = newAcc.find(x => x.name == cloudCredName)
                                    cloudCredWithSameName match {
                                      case None => newAcc :+ CloudCredWithPolicies(cloudCredName, List(nextPolicyInCluster), List(clusterCred), Some(cloudCredResponse))
                                      case Some(cloudCredWithPolicies) =>
                                        val index = newAcc.indexOf(cloudCredWithPolicies)
                                        val updatedClusterList = cloudCredWithPolicies.clusters.find(x => x.clusterId == clusterCred.clusterId) match {
                                          case None => cloudCredWithPolicies.clusters :+ clusterCred
                                          case Some(result) => cloudCredWithPolicies.clusters
                                        }
                                        val updatedPoliciesList = cloudCredWithPolicies.policies.find(x => x.policyId == nextPolicyInCluster.policyId) match {
                                          case None => cloudCredWithPolicies.policies :+ nextPolicyInCluster
                                          case Some(result) => cloudCredWithPolicies.policies
                                        }

                                        newAcc.updated(index, CloudCredWithPolicies(cloudCredWithPolicies.name, updatedPoliciesList, updatedClusterList, cloudCredWithPolicies.cloudCred))
                                    }
                                }
                            }
                        }
                      }

                      newAcc
                    }
                  }
                  // cloud credentials registered to DLM but not yet registered with any beacon clusters
                  val dlmCloudCred = cloudAccounts.accounts.foldLeft(List(): List[CloudCredWithPolicies]) {
                    (acc, next) => {
                      allCloudCredentials.find(x => x.name == next.id) match {
                        case None => acc :+ CloudCredWithPolicies(next.id, List(), List(), None)
                        case Some(cloudCredWithPolicies) => acc
                      }
                    }
                  }
                  p.success(Right(CloudCredWithPoliciesResponse(failedResponses ++ adminStatusResponse.unreachableBeacon, allCloudCredentials ++ dlmCloudCred)))
                }
              }
            })
        })
    }

    p.future
  }

  def getClusterCred(cloudAccounts: CloudAccountsBody, clusterId: Long, cloudCredName: String,
                     cloudCredResponse: CloudCredResponse): ClusterCred = {
    val isInSync = false
    cloudAccounts.accounts.find(x => x.id == cloudCredName) match {
      case None => ClusterCred(clusterId, isInSync)
      case Some(dlmAccount) => cloudCredResponse.configs match {
        case None => ClusterCred(clusterId, isInSync)
        case Some(configs) => {
          configs.get("version") match {
            case None => ClusterCred(clusterId, isInSync)
            case Some(version) => ClusterCred(clusterId, dlmAccount.version == version.toLong)
          }
        }
      }
    }
  }


  /**
    * Get cloud credential details
    *
    * @param clusterId      cluster id
    * @param cloudCredId    cloudcred id
    * @return
    */
  def getCloudCredById(clusterId: Long, cloudCredId: String)
               (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, CloudCredResponse]] = {
    val p: Promise[Either[BeaconApiErrors, CloudCredResponse]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        beaconCloudCredService.getCloudCred(beaconUrl, clusterId, cloudCredId).map({
          case Left(errors) => p.success(Left(errors))
          case Right(cloudCredResponse) => p.success(Right(cloudCredResponse))
        })
    }
    p.future
  }

  /**
    * Get cloud credential details
    *
    * @param clusterId      cluster id
    * @param cloudCredName    cloudcred id
    * @return
    */
  def getCloudCredByName(clusterId: Long, cloudCredName: String)
                                (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Seq[CloudCredResponse]]] = {
    val p: Promise[Either[BeaconApiErrors, Seq[CloudCredResponse]]] = Promise()
    dataplaneService.getBeaconService(clusterId).map {
      case Left(errors) => p.success(Left(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, Some(errors.errors.map(x => BeaconApiError(x.message)).head))))
      case Right(beaconUrl) =>
        val queryString = Map(("filterBy",s"name:$cloudCredName"))
        getFilteredCloudCredByName(beaconUrl, clusterId, queryString).map({
          case Left(errors) => p.success(Left(errors))
          case Right(cloudCredResponse) => p.success(Right(cloudCredResponse))
        })
    }
    p.future
  }


  /**
    * Get cloud credential details
    *
    * @param beaconUrl      beacon url
    * @param clusterId      cluster id
    * @return
    */
  def getFilteredCloudCredByName(beaconUrl: String, clusterId: Long, queryString: Map[String, String])
                      (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Seq[CloudCredResponse]]] = {
    val p: Promise[Either[BeaconApiErrors, Seq[CloudCredResponse]]] = Promise()
    beaconCloudCredService.listAllCloudCred(beaconUrl, clusterId, queryString).map({
      case Left(errors) => p.success(Left(errors))
      case Right(cloudCredsBeaconResponse) =>
        p.success(Right(cloudCredsBeaconResponse.cloudCreds.cloudCred))
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
  lazy val QUERY_PARAM_FILEPATH_KEY = "path"

  lazy val PAIR_CLUSTER_SIZE = 2


  def submitTypeError(submitType: String) : String = "Value passed submitType = " + submitType + " is invalid. Valid values for submitType are SUBMIT | SUBMIT_AND_SCHEDULE"
  def clusterPairPaylodError = "Request payload should be a set of two objects"
  def pairClusterError = "Error occurred while getting API response from DB service or/and Beacon service"
  def clusterDefError = "Error occurred while getting cluster definitions from Beacon service"
  def pathErrorMsg = "List HDFS file status API expects path parameter in the query"

}

