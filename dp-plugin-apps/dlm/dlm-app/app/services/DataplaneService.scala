package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake, Location, Error, Errors, ClusterService => ClusterData}
import com.hortonworks.dataplane.db.Webserice.{ClusterComponentService, ClusterService, LakeService, LocationService}
import models.Entities.BeaconCluster
import models.JsonResponses
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future,Promise}

/**
  * `DataplaneService` class interacts with dataplane webservice
  * @param clusterService   db service to communicate with dataplane cluster endpoint
  * @param clusterComponentService  db service to communicate with dataplane cluster component service endpoint
  */
@Singleton
class DataplaneService @Inject()(
  @Named("clusterService") val clusterService: ClusterService,
  @Named("clusterComponentService") val clusterComponentService: ClusterComponentService,
  @Named("lakeService") val lakeService: LakeService,
  @Named("locationService") val locationService: LocationService) {

  /**
    * Get details of the clusters that has Beacon server installed
    * @return [[models.Entities.BeaconCluster]]
    */
  def getBeaconClusters : Future[Either[Errors, Seq[BeaconCluster]]] = {
    val p: Promise[Either[Errors, Seq[BeaconCluster]]] = Promise()
    val serviceName = "BEACON_SERVER"
    val beaconClusters = for {
      clusters <- clusterService.list()
      datalakes <-  lakeService.list()
      beaconClusters <- clusterComponentService.getServicesByName(serviceName)
    } yield {

      val locationFutureList:Seq[Future[Either[Errors, Location]]] = beaconClusters.right.get.foldLeft(List():List[Future[Either[Errors, Location]]]) {
        (acc, next) => {
          val cluster: Cluster = clusters.right.get.find(_.id == next.clusterid).get
          val lakeLocationId: Long = datalakes.right.get.filter(x => x.id.isDefined).find(_.id == cluster.datalakeid).get.location.get
          locationService.retrieve(lakeLocationId) :: acc
        }.reverse
      }

      val allLocations = for {
        allLocations <- Future.sequence(locationFutureList)
      } yield {
        val allBeaconClusters = beaconClusters.right.get.map((clusterData: ClusterData) => {
          val cluster: Cluster = clusters.right.get.find(_.id == clusterData.clusterid).get
          val lake: Datalake = datalakes.right.get.filter(x => x.id.isDefined).find(_.id == cluster.datalakeid).get
          val location: Location = allLocations.filter(_.isRight).map(_.right.get).find(_.id == lake.location).get // .find(_.id == lake.location).get

          BeaconCluster(
            cluster.id.get,
            cluster.name,
            cluster.description,
            cluster.ambariurl,
            lake,
            location,
            Seq(clusterData)
          )
        })
        p.success(Right(allBeaconClusters))                                   
      }

      allLocations.onFailure {
        case e: Exception => {
          p.trySuccess(Left(Errors(Seq(Error("500", e.getMessage)))))
        }
      }
    }

    beaconClusters.onFailure {
      case e: Exception => {
        p.trySuccess(Left(Errors(Seq(Error("500", e.getMessage)))))
      }
    }
    p.future
  }

  /**
    * Gets list of beacon urls registered with dataplane
    * @return
    */
  def getBeaconUrls : Future[Either[String,Seq[String]]] = {
    val serviceName = "BEACON_SERVER"
    val beaconClusters = for {
      beaconClusters <- clusterComponentService.getServicesByName(serviceName)
    } yield {
      beaconClusters.right.get.map((clusterData: ClusterData) => {
        clusterData.fullURL.get
      })
    }
    beaconClusters.map(x => Right(x)).recoverWith {
      case e: Exception =>
        Future.successful(Left(e.getMessage))
    }
  }

  /**
    * Get future for cluster details from datapane db client
    * @param clusterId cluster id
    * @return
    */
  def getCluster(clusterId: Long): Future[Either[Errors, Cluster]] = {
    clusterService.retrieve(clusterId.toString)
  }

  /**
    *  Get future for namenode details from dataplane db client
    * @param clusterId cluster id
    * @return
    */
  def getNameNodeService(clusterId: Long): Future[Either[Errors, ClusterData]] = {
    clusterComponentService.getServiceByName(clusterId, "NAMENODE")
  }
}
