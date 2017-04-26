package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dlm.beacon.domain.ResponseEntities.BeaconApiErrors
import com.hortonworks.dlm.beacon.domain.ResponseEntities.BeaconApiError
import com.hortonworks.dlm.beacon.WebService.{BeaconClusterService,BeaconClusterPairService}
import com.hortonworks.dlm.beacon.domain.RequestEntities.ClusterDefinitionRequest
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{PairedCluster, PostActionResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import models.Entities.{ClusterDefinition, PairClusterRequest, PairedClustersResponse, ClusterDefinitionDetails}

import scala.collection.immutable.Set.Set2
import scala.concurrent.Future
import scala.concurrent.Promise

/**
  * `BeaconService` class interacts with beacon rest APIs
  * @param beaconClusterService  beacon service to communicate with beacon cluster endpoint
  * @param dataplaneService      dataplane service to interact with dataplane db service
  */
@Singleton
class BeaconService @Inject()(
   @Named("beaconClusterService") val beaconClusterService: BeaconClusterService,
   @Named("beaconClusterPairService") val beaconClusterPairService: BeaconClusterPairService,
          val dataplaneService: DataplaneService) {

  /**
    * Get list of all paired clusters
    *
    * @return  @return Seq[Seq[[PairedCluster]]
    */
  def getAllPairedClusters: Future[Either[BeaconApiErrors,PairedClustersResponse]] = {
    val p: Promise[Either[BeaconApiErrors,PairedClustersResponse]] = Promise()
    dataplaneService.getBeaconUrls.map(beaconUrls=>beaconUrls match {
      case Left(msg) =>  {
        p.success(Left(BeaconApiErrors(Seq(BeaconApiError("500", msg, None)))))
      }
      case Right(beaconUrls) => {
        val allPairedClusterFuture:Future[Seq[Either[BeaconApiErrors, Seq[PairedCluster]]]] =
          Future.sequence(beaconUrls.map((x) => beaconClusterPairService.listPairedClusters(x)))
        for {
          allPairedClustersOption <- allPairedClusterFuture
        } yield {
          val allPairedClusters:Seq[PairedCluster] = allPairedClustersOption.filter(_.isRight).flatMap(_.right.get)
          val setOfPairedClusters: Set[Set2[String]] = allPairedClusters.foldLeft(Set():Set[Set2[String]]) {
            (acc, next) => {
              if (next.peers.isEmpty) acc else {
                next.peers.map(x=>Set(next.name,x).asInstanceOf[Set2[String]]).toSet ++ acc
              }
            }
          }

          val unreachableBeaconClusters:Seq[String] = allPairedClustersOption.filter(_.isLeft).
            flatMap(_.left.get.errors).map(_.beaconUrl.get)

          p.success(Right(PairedClustersResponse(unreachableBeaconClusters, setOfPairedClusters)))
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
        peerClusterA <- beaconClusterPairService.listPairedClusters(clustersToBePairedSeq.head.beaconUrl)
        peerClusterB <- beaconClusterPairService.listPairedClusters(clustersToBePairedSeq.tail.head.beaconUrl)
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
    beaconClusterPairService.createClusterPair(listOfClusters.head.pairedClusterRequest.beaconUrl,
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
          beaconClusterPairService.createClusterUnpair(clustersToBeUnpairedSeq.head.beaconUrl,clusterB.right.get.name,clustersToBeUnpairedSeq.tail.head.beaconUrl).map({
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
}
