package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{
  Cluster,
  DataplaneCluster,
  Error,
  Errors,
  Location
}
import com.hortonworks.dataplane.commons.domain.Ambari.{
  ClusterServiceWithConfigs,
  ClusterProperties,
  ConfigurationInfo,
  NameNodeInfo
}
import com.hortonworks.dataplane.db.Webservice.{
  ClusterComponentService,
  ClusterService,
  DpClusterService,
  LocationService
}
import models.Entities.{
  ClusterStats,
  BeaconCluster,
  BeaconClusters,
  ClusterServiceEndpointDetails
}
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

/**
  * `DataplaneService` class interacts with dataplane webservice
  * @param clusterService   db service to communicate with dataplane cluster endpoint
  * @param clusterComponentService  db service to communicate with dataplane cluster component service endpoint
  */
@Singleton
class DataplaneService @Inject()(
    @Named("clusterService") val clusterService: ClusterService,
    @Named("clusterComponentService") val clusterComponentService: ClusterComponentService,
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    @Named("locationService") val locationService: LocationService) {

  /**
    * Get details of the clusters that has Beacon server installed
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

            val totalHosts : Option[Long] = cluster.properties match {
              case Some(clusterProperties) => Some(clusterProperties.validate[ClusterProperties].get.total_hosts)
              case None => None
            }

            val beaconServiceDetails
              : Either[Errors, ClusterServiceEndpointDetails] =
              getBeaconEndpointDetails(endpointData)
            beaconServiceDetails match {
              case Right(beaconServiceDetails) =>
                Right(
                  BeaconCluster(
                    cluster.id.get,
                    cluster.name,
                    dataplaneCluster.dcName,
                    dataplaneCluster.description,
                    cluster.clusterUrl,
                    namenodeStats,
                    totalHosts,
                    location,
                    Seq(beaconServiceDetails)
                  ))
              case Left(errors) => Left(errors)
            }
          })
        if (!allBeaconClusters.exists(_.isLeft)) {
          p.success(Right(BeaconClusters(allBeaconClusters.map(_.right.get))))
        } else {
          val errors: Errors = allBeaconClusters.find(_.isLeft).get.left.get
          p.trySuccess(Left(errors))
        }
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
  def getBeaconUrls: Future[Either[Errors, Seq[String]]] = {
    val p: Promise[Either[Errors, Seq[String]]] = Promise()

    clusterComponentService
      .getAllServiceEndpoints(DataplaneService.BEACON_SERVER)
      .map({
        case Right(beaconClusters) => {
          val beaconUrls = beaconClusters.map(x => {
            val beaconServiceDetails
              : Either[Errors, ClusterServiceEndpointDetails] =
              getBeaconEndpointDetails(x)

            beaconServiceDetails match {
              case Right(beaconServiceDetails) =>
                Right(beaconServiceDetails.fullURL)
              case Left(errors) => Left(errors)
            }
          })

          if (!beaconUrls.exists(_.isLeft)) {
            p.success(Right(beaconUrls.map(_.right.get)))
          } else {
            val errors: Errors = beaconUrls.find(_.isLeft).get.left.get
            p.trySuccess(Left(errors))
          }

        }
        case Left(errors) => p.success(Left(errors))
      })

    p.future
  }

  /**
    * Get beacon server endpoint
    * @param endpointData service host and properties details
    * @return
    */
  def getBeaconEndpointDetails(endpointData: ClusterServiceWithConfigs)
    : Either[Errors, ClusterServiceEndpointDetails] = {
    val beaconPort: Either[Errors, String] =
      getPropertyValue(endpointData, "beacon-env", "beacon_port")
    beaconPort match {
      case Right(beaconPort) =>
        val beaconHostName = endpointData.servicehost
        val fullurl = s"http://$beaconHostName:$beaconPort"
        Right(
          ClusterServiceEndpointDetails(endpointData.serviceid,
                                        endpointData.servicename,
                                        endpointData.clusterid,
                                        beaconHostName,
                                        fullurl))
      case Left(errors) => Left(errors)
    }
  }

  /**
    * Get namenode node endpoint details for rpc connection
    * @param endpointData configuration blob for namenode
    * @return
    */
  def getNameNodeRpcEndpointDetails(endpointData: ClusterServiceWithConfigs)
    : Either[Errors, ClusterServiceEndpointDetails] = {
    val fullurl: Either[Errors, String] =
      getPropertyValue(endpointData, "core-site", "fs.defaultFS")
    fullurl match {
      case Right(fullurl) => {
        val namenodeHostName = endpointData.servicehost
        Right(
          ClusterServiceEndpointDetails(endpointData.serviceid,
                                        endpointData.servicename,
                                        endpointData.clusterid,
                                        namenodeHostName,
                                        fullurl))
      }
      case Left(errors) => Left(errors)
    }
  }

  /**
    * Get namenode node endpoint details for http connection
    * @param endpointData configuration blob for namenode
    * @return
    */
  def getNameNodeHttpEndpointDetails(endpointData: ClusterServiceWithConfigs)
    : Either[Errors, ClusterServiceEndpointDetails] = {
    val endpoint: Either[Errors, String] =
      getPropertyValue(endpointData, "hdfs-site", "dfs.namenode.http-address")
    endpoint match {
      case Right(endpoint) => {
        val namenodeHostName = endpointData.servicehost
        val namenodePort: Int = new java.net.URI(s"http://$endpoint").getPort
        val fullurl = s"http://$namenodeHostName:$namenodePort"
        Right(
          ClusterServiceEndpointDetails(endpointData.serviceid,
                                        endpointData.servicename,
                                        endpointData.clusterid,
                                        namenodeHostName,
                                        fullurl))
      }
      case Left(errors) => Left(errors)
    }
  }

  /**
    * Get hive server2 endpoint details for http thrift connection
    * @param endpointData  configuration blob for hive server2
    * @return
    */
  def getHiveServerEndpointDetails(endpointData: ClusterServiceWithConfigs)
    : Either[Errors, ClusterServiceEndpointDetails] = {
    val hiveServerPort: Either[Errors, String] =
      getPropertyValue(endpointData, "hive-site", "hive.server2.thrift.port")
    hiveServerPort match {
      case Right(hiveServerPort) => {
        val hiveServerHostName = endpointData.servicehost
        val fullurl = s"http://$hiveServerHostName:$hiveServerPort"
        Right(
          ClusterServiceEndpointDetails(endpointData.serviceid,
                                        endpointData.servicename,
                                        endpointData.clusterid,
                                        hiveServerHostName,
                                        fullurl))
      }
      case Left(errors) => Left(errors)
    }
  }

  /**
    *
    * @param endpointData  configuration blob
    * @param configType    config type
    * @param configName    config property name
    * @return
    */
  def getPropertyValue(endpointData: ClusterServiceWithConfigs,
                       configType: String,
                       configName: String): Either[Errors, String] = {
    val serviceName = endpointData.servicename
    val configProperties: Option[ConfigurationInfo] =
      endpointData.configProperties
    configProperties match {
      case Some(configTypes) => {
        val configProperties =
          configTypes.properties.find(_.`type` == configType)
        configProperties match {
          case Some(configProperties) => {
            configProperties.properties.get(configName) match {
              case Some(configValue) => Right(configValue)
              case None => {
                val errorMsg =
                  s"$configName is not found in $configType for $serviceName"
                Logger.error(errorMsg)
                Left(Errors(Seq(Error("500", errorMsg))))
              }
            }
          }
          case None => {
            val errorMsg = s"$configType is not associated with $serviceName"
            Logger.error(errorMsg)
            Left(Errors(Seq(Error("500", errorMsg))))
          }
        }

      }
      case None => {
        val errorMsg = s"configuration blob is not availaible for $serviceName"
        Logger.error(errorMsg)
        Left(Errors(Seq(Error("500", errorMsg))))
      }
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
    * Get future for cluster details from datapane db client
    * @return
    */
  def getAllClusters: Future[Either[Errors, Seq[Cluster]]] = {
    clusterService.list()
  }


  /**
    *  Get future for service details from dataplane db client
    * @param clusterId cluster id
    * @return
    */
  def getBeaconService(clusterId: Long)
    : Future[Either[Errors, ClusterServiceEndpointDetails]] = {
    getServiceEndpointDetails(clusterId,
                              DataplaneService.BEACON_SERVER,
                              getBeaconEndpointDetails)
  }

  /**
    *  Get future for namenode details from dataplane db client
    * @param clusterId cluster id
    * @return
    */
  def getNameNodeService(clusterId: Long)
    : Future[Either[Errors, ClusterServiceEndpointDetails]] = {
    getServiceEndpointDetails(clusterId,
                              DataplaneService.NAMENODE,
                              getNameNodeRpcEndpointDetails)
  }

  /**
    * Get future for namenode details from dataplane db client
    * @param clusterId cluster id
    * @return
    */
  def getNameNodeHttpService(clusterId: Long)
    : Future[Either[Errors, ClusterServiceEndpointDetails]] = {
    getServiceEndpointDetails(clusterId,
                              DataplaneService.NAMENODE,
                              getNameNodeHttpEndpointDetails)
  }

  /**
    *  Get future for Hive Server details from dataplane
    * @param clusterId cluster id
    * @return
    */
  def getHiveServerService(clusterId: Long)
    : Future[Either[Errors, ClusterServiceEndpointDetails]] = {
    getServiceEndpointDetails(clusterId,
                              DataplaneService.HIVE_SERVER,
                              getHiveServerEndpointDetails)
  }

  /**
    * Get future for service details from dataplane
    * @param clusterId cluster id
    * @return
    */
  def getServiceEndpointDetails(
      clusterId: Long,
      serviceName: String,
      f: ClusterServiceWithConfigs => Either[Errors,
                                             ClusterServiceEndpointDetails])
    : Future[Either[Errors, ClusterServiceEndpointDetails]] = {
    val p: Promise[Either[Errors, ClusterServiceEndpointDetails]] = Promise()
    clusterComponentService
      .getEndpointsForCluster(clusterId, serviceName)
      .map({
        case Right(clusterServiceWithConfigs) => {
          val serviceDetails: Either[Errors, ClusterServiceEndpointDetails] =
            f(clusterServiceWithConfigs)
          serviceDetails match {
            case Right(serviceDetails) => p.success(Right(serviceDetails))
            case Left(errors) => p.success(Left(errors))
          }
        }
        case Left(errors) => p.success(Left(errors))
      })
    p.future
  }
}

object DataplaneService {
  val BEACON_SERVER = "BEACON"
  val NAMENODE = "NAMENODE"
  val HIVE_SERVER = "HIVE"
}
