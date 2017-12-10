/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import com.google.inject.name.Named
import com.google.inject.{Inject, Singleton}
import com.hortonworks.dataplane.commons.domain.Ambari.{
  ClusterProperties,
  ClusterServiceWithConfigs,
  ConfigurationInfo,
  NameNodeInfo
}
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.{
  ClusterComponentService,
  ClusterService,
  DpClusterService,
  LocationService
}
import models.Entities.{
  BeaconCluster,
  BeaconClusters,
  ClusterIdWithBeaconUrl,
  ClusterStats
}
import play.api.Logger
import utils.EndpointService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

/**
  * `DataplaneService` class interacts with dataplane webservice
  *
  * @param clusterService          db service to communicate with dataplane cluster endpoint
  * @param clusterComponentService db service to communicate with dataplane cluster component service endpoint
  */
@Singleton
class DataplaneService @Inject()(
    val eps: EndpointService,
    @Named("clusterService") val clusterService: ClusterService,
    @Named("clusterComponentService") val clusterComponentService: ClusterComponentService,
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    @Named("locationService") val locationService: LocationService) {

  private type ConfigToUrl = ClusterServiceWithConfigs => Future[Either[Errors, String]]


  /**
    * Get details of the clusters that has Beacon server installed
    *
    * @return [[models.Entities.BeaconCluster]]
    */
  def getBeaconClusters: Future[Either[Errors, BeaconClusters]] = {
    val p: Promise[Either[Errors, BeaconClusters]] = Promise()
    val beaconClusters = for {
      clusters <- clusterService.list()
      dataplaneClusters <- dpClusterService.list()
      beaconClusters <- clusterComponentService.getAllServiceEndpoints(
        DataplaneService.BEACON_SERVER)
      namenodeServices <- clusterComponentService.getAllServiceEndpoints(
        DataplaneService.NAMENODE)
    } yield {

      val locationFutureList: Seq[Future[Either[Errors, Location]]] =
        beaconClusters.right.get
          .foldLeft(List(): List[Future[Either[Errors, Location]]]) {
            (acc, next) =>
              {
                val cluster: Cluster =
                  clusters.right.get.find(_.id == next.clusterid).get
                val dpClusterLocationId: Long = dataplaneClusters.right.get
                  .filter(x => x.id.isDefined)
                  .find(_.id == cluster.dataplaneClusterId)
                  .get
                  .location
                  .get
                locationService.retrieve(dpClusterLocationId) :: acc
              }.reverse
          }

      val allLocations = for {
        allLocations <- Future.sequence(locationFutureList)
      } yield {
        val allBeaconClusters = beaconClusters.right.get
          .map((endpointData: ClusterServiceWithConfigs) => {
            val cluster: Cluster =
              clusters.right.get.find(_.id == endpointData.clusterid).get
            val dataplaneCluster: DataplaneCluster = dataplaneClusters.right.get
              .filter(x => x.id.isDefined)
              .find(_.id == cluster.dataplaneClusterId)
              .get
            val location: Location = allLocations
              .filter(_.isRight)
              .map(_.right.get)
              .find(_.id == dataplaneCluster.location)
              .get
            val namenodeService: ClusterServiceWithConfigs =
              namenodeServices.right.get.find(_.clusterid == cluster.id).get
            val namenodeStats = namenodeService.configProperties match {
              case Some(configInfo) =>
                configInfo.stats.validate[NameNodeInfo].asOpt match {
                  case Some(namenodeAllStats) =>
                    Some(
                      ClusterStats(namenodeAllStats.CapacityTotal,
                                   namenodeAllStats.CapacityUsed,
                                   namenodeAllStats.CapacityRemaining))
                  case None => None
                }
              case None => None
            }

            val totalHosts: Option[Long] = cluster.properties match {
              case Some(clusterProperties) =>
                Some(
                  clusterProperties.validate[ClusterProperties].get.total_hosts)
              case None => None
            }

            val beaconEndpoint: Future[Either[Errors, String]] =
              eps.getBeaconEndpoint(endpointData)
            beaconEndpoint map {
              case Right(be) =>
                Right(
                  newBeaconCluster(cluster,
                                   dataplaneCluster,
                                   location,
                                   namenodeStats,
                                   totalHosts,
                                   be))
              case Left(errors) => Left(errors)
            }
          })

        val beaconClusterList = Future.sequence(allBeaconClusters)
        beaconClusterList.map { bc =>
          if (!bc.exists(_.isLeft)) {
            p.success(Right(BeaconClusters(bc.map(_.right.get))))
          } else {
            val errors: Errors = bc.find(_.isLeft).get.left.get
            p.trySuccess(Left(errors))
          }
        }
      }

      allLocations.onFailure {
        case e: Exception =>
          p.trySuccess(Left(Errors(Seq(Error("500", e.getMessage)))))
      }
    }

    beaconClusters.onFailure {
      case e: Exception =>
        p.trySuccess(Left(Errors(Seq(Error("500", e.getMessage)))))
    }

    p.future
  }

  private def newBeaconCluster(cluster: Cluster,
                               dataplaneCluster: DataplaneCluster,
                               location: Location,
                               namenodeStats: Option[ClusterStats],
                               totalHosts: Option[Long],
                               be: String) = {
    BeaconCluster(
      cluster.id.get,
      cluster.name,
      dataplaneCluster.dcName,
      dataplaneCluster.description,
      cluster.clusterUrl,
      namenodeStats,
      totalHosts,
      location,
      be
    )
  }

  /**
    * Gets list of clusterids with beacon urls registered with dataplane
    *
    * @return
    */
  def getClusterIdWithBeaconUrls
    : Future[Either[Errors, Seq[ClusterIdWithBeaconUrl]]] = {

    clusterComponentService
      .getAllServiceEndpoints(DataplaneService.BEACON_SERVER)
      .flatMap({
        case Right(beaconClusters) =>
          val clusterIdWithBeaconUrl : Future[Seq[Either[Errors, ClusterIdWithBeaconUrl]]] = {
            val seq = beaconClusters.map(x => {
              eps.getBeaconEndpoint(x) map {
                case Right(bu) =>
                  Right(ClusterIdWithBeaconUrl(bu, x.clusterid.get))
                case Left(errors) => Left(errors)
              }
            })
          Future.sequence(seq)
          }

          clusterIdWithBeaconUrl.map { v =>
            if (!v.exists(_.isLeft)) {
              Right(v.map(_.right.get))
            } else {
              val errors: Errors =
                v.find(_.isLeft).get.left.get
              Left(errors)
            }
          }
        case Left(errors) => Future.successful(Left(errors))
      })

  }

  /**
    * Get future for cluster details from datapane db client
    *
    * @param clusterId cluster id
    * @return
    */
  def getCluster(clusterId: Long): Future[Either[Errors, Cluster]] = {
    clusterService.retrieve(clusterId.toString)
  }

  /**
    * Get future for cluster details from datapane db client
    *
    * @param clusterId cluster id
    * @return
    */
  def getDpCluster(
      clusterId: Long): Future[Either[Errors, DataplaneCluster]] = {
    dpClusterService.retrieve(clusterId.toString)
  }

  /**
    * Get future for cluster details from datapane db client
    *
    * @return
    */
  def getAllClusters: Future[Either[Errors, Seq[Cluster]]] = {
    clusterService.list()
  }

  /**
    * Get future for service details from dataplane db client
    *
    * @param clusterId cluster id
    * @return
    */
  def getBeaconService(clusterId: Long): Future[Either[Errors, String]] = {
    getServiceEndpoint(clusterId,
                       DataplaneService.BEACON_SERVER,
                       eps.getBeaconEndpoint)
  }

  /**
    * Get future for service details from dataplane
    *
    * @param clusterId cluster id
    * @return
    */
  def getServiceEndpoint(
      clusterId: Long,
      serviceName: String,
      f: ConfigToUrl)
    : Future[Either[Errors, String]] = {
    clusterComponentService
      .getEndpointsForCluster(clusterId, serviceName)
      .flatMap({
        case Right(clusterServiceWithConfigs) =>
          val serviceEndpoint = f(clusterServiceWithConfigs)
          serviceEndpoint map {
            case Right(se)    => Right(se)
            case Left(errors) => Left(errors)
          }
        case Left(errors) => Future.successful(Left(errors))
      })
  }

  def getServiceConfigs(clusterId: Long, serviceName: String)
    : Future[Either[Errors, ClusterServiceWithConfigs]] = {
    clusterComponentService
      .getEndpointsForCluster(clusterId, serviceName)
  }
}

object DataplaneService {
  val BEACON_SERVER = "BEACON"
  val NAMENODE = "NAMENODE"
}
