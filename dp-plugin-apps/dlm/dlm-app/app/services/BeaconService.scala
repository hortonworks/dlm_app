package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dlm.beacon.domain.ResponseEntities.BeaconApiErrors
import com.hortonworks.dlm.beacon.domain.ResponseEntities.BeaconApiError
import com.hortonworks.dlm.beacon.WebService.BeaconClusterService
import com.hortonworks.dlm.beacon.domain.ResponseEntities.BeaconClusterResponse
import scala.concurrent.ExecutionContext.Implicits.global

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
          val dataplaneService: DataplaneService) {

  /**
    * Get list of all paired clusters
    * @return  @return [[BeaconClusterResponse]]
    */
   def getAllPairedClusters(): Future[Either[BeaconApiErrors,Seq[BeaconClusterResponse]]] = {
     val p: Promise[Either[BeaconApiErrors,Seq[BeaconClusterResponse]]] = Promise()
     dataplaneService.getBeaconUrls().map(beaconUrls=>beaconUrls match {
       case Left(msg) =>  p.success(Left(BeaconApiErrors(Seq(BeaconApiError("500", msg)))))
       case Right(beaconUrls) => {
         val allPairedClusterFuture:Future[Seq[Either[BeaconApiErrors, BeaconClusterResponse]]] =
           Future.sequence(beaconUrls.map((x) => beaconClusterService.listPairedClusters(x)))
         for {
           allPairedClustersOption <- allPairedClusterFuture
         } yield {
           val allPairedClusters:Seq[BeaconClusterResponse] = allPairedClustersOption.filter(_.isRight).map(x=>x.right.get)
           p.success(Right(allPairedClusters))
         }
       }
     })
     p.future
   }
}
