/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster, Error, Errors, Location}
import com.hortonworks.dataplane.commons.domain.Ambari.{ClusterProperties, ClusterServiceWithConfigs, ConfigurationInfo, NameNodeInfo}
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterService, DpClusterService, LocationService}
import models.Entities.{BeaconCluster, BeaconClusters, ClusterServiceEndpointDetails, ClusterStats, ClusterIdWithBeaconUrl}
import play.api.Logger
import play.api.http.Status.BAD_GATEWAY

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

            val beaconEndpoint
              : Either[Errors, String] =
              getBeaconEndpoint(endpointData)
            beaconEndpoint match {
              case Right(beaconEndpoint) =>
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
                    beaconEndpoint
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
    * Gets list of clusterids with beacon urls registered with dataplane
    * @return
    */
  def getClusterIdWithBeaconUrls: Future[Either[Errors, Seq[ClusterIdWithBeaconUrl]]] = {
    val p: Promise[Either[Errors, Seq[ClusterIdWithBeaconUrl]]] = Promise()

    clusterComponentService
      .getAllServiceEndpoints(DataplaneService.BEACON_SERVER)
      .map({
        case Right(beaconClusters) => {
          val clusterIdWithBeaconUrl : Seq[Either[Errors, ClusterIdWithBeaconUrl]] = beaconClusters.map(x => {
            val beaconUrl
              : Either[Errors, String] =
              getBeaconEndpoint(x)

            beaconUrl match {
              case Right(beaconUrl) =>
                Right(ClusterIdWithBeaconUrl(beaconUrl, x.clusterid.get))
              case Left(errors) => Left(errors)
            }
          })

          if (!clusterIdWithBeaconUrl.exists(_.isLeft)) {
            p.success(Right(clusterIdWithBeaconUrl.map(_.right.get)))
          } else {
            val errors: Errors = clusterIdWithBeaconUrl.find(_.isLeft).get.left.get
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
  def getBeaconEndpoint(endpointData: ClusterServiceWithConfigs): Either[Errors, String] = {

    val beaconSchemePortMap = Map("http" -> "beacon_port", "https" -> "beacon_tls_enabled")
    val beaconScheme : String = getPropertyValue(endpointData, "beacon-env", "beacon_tls_enabled") match {
      case Right(beaconScheme) => if (beaconScheme == "true") "https" else "http"
      case Left(errors) => "http"
    }

    val beaconPort =  getPropertyValue(endpointData, "beacon-env", beaconSchemePortMap(beaconScheme))

    beaconPort match {
      case Right(beaconPort) =>
        val beaconHostName = endpointData.servicehost
        val beaconEndpoint = s"$beaconScheme://$beaconHostName:$beaconPort"
        Right(beaconEndpoint)
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
    val fsEndpoint: Either[Errors, String] =
      getPropertyValue(endpointData, "core-site", "fs.defaultFS")

    fsEndpoint match {
      case Right(fsEndpoint) => {
        val namenodeHostName = endpointData.servicehost
        val nnKerberosPrincipal : Option[String] =  getPropertyValue(endpointData, "hdfs-site", "dfs.namenode.kerberos.principal") match {
          case Left(errors) => Some("nn/_HOST@EXAMPLE.COM")
          case Right(nnKerberosPrincipal) => Some(nnKerberosPrincipal)
        }

        val dfsNameService: Option[String] =  convertEitherToOption(getPropertyValue(endpointData, "hdfs-site", "dfs.nameservices"))
        val dfsInternalNameServices: Option[String] =  convertEitherToOption(getPropertyValue(endpointData, "hdfs-site", "dfs.internal.nameservices"))
        val nnHaDynamicKeyConfigs: Map[String, Option[String]] =  dfsInternalNameServices match {
          case Some(nameService) => {
            val internalNameService =  nameService.split(",")(0)
            val dfsHaNnPrefixValue = convertEitherToOption(getPropertyValue(endpointData, "hdfs-site", s"dfs.ha.namenodes.$internalNameService"))
            dfsHaNnPrefixValue match {
              case Some(dfsHaNnPrefixValue) => {
                val endpointConfigs : Seq[String] = dfsHaNnPrefixValue.split(",").map((x) => s"dfs.namenode.rpc-address.$dfsInternalNameServices.$x")
                val nnHaConfigs = endpointConfigs :+ s"dfs.client.failover.proxy.provider.$dfsInternalNameServices"
                Map(s"dfs.ha.namenodes.$internalNameService" -> Some(dfsHaNnPrefixValue)) ++ nnHaConfigs.foldLeft(Map(): Map[String, Option[String]]) {
                  (acc, next) => {
                    val nextConfigValue: Option[String] = convertEitherToOption(getPropertyValue(endpointData, "hdfs-site", next))
                    acc + (next -> nextConfigValue)
                  }
                }

              }
              case None => Map()
            }
          }
          case None => Map()
        }


        val hdfsServiceConfigMap : Map[String, Option[String]] = Map(
          "fsEndpoint" -> Some(fsEndpoint),
          "nnKerberosPrincipal" -> nnKerberosPrincipal,
          "dfs.nameservices" ->  dfsNameService,
          "dfs.internal.nameservices" -> dfsInternalNameServices
        ) ++ nnHaDynamicKeyConfigs

        Right(
          ClusterServiceEndpointDetails(endpointData.serviceid,
                                        endpointData.servicename,
                                        endpointData.clusterid,
                                        namenodeHostName,
                                        hdfsServiceConfigMap))
      }
      case Left(errors) => Left(errors)
    }
  }

  def convertEitherToOption[T](data: Either[Errors, T]) : Option[T] = {
    data match {
      case Right(x) => Some(x)
      case Left(errors) => None
    }
  }

  /**
    * Get namenode endpoint details for http connection
    * @param endpointData configuration blob for namenode
    * @param namenodeHostName namenode hostname
    * @param isNameNodeHAEnabled HA status of the namenode
    * @return                                                                   
    */
  def getNameNodeHttpEndpointDetails(endpointData: ClusterServiceWithConfigs, namenodeHostName: String, isNameNodeHAEnabled: Boolean)
    : Either[Errors, ClusterServiceEndpointDetails] = {

    val nameNodeSchemePortMap = Map("http" -> "dfs.namenode.http-address", "https" -> "dfs.namenode.https-address")

    val nameNodeScheme : String = getPropertyValue(endpointData, "hdfs-site", "dfs.http.policy") match {
      case Right(nameNodeScheme) => if (nameNodeScheme == "HTTPS_ONLY") "https" else "http"
      case Left(errors) => "http"
    }

    val endpoint: Either[Errors, String] = if (isNameNodeHAEnabled) {
      getPropertyValue(endpointData, "hdfs-site", "dfs.internal.nameservices") match {
        case Right(nameService) => {
          val internalNameService =  nameService.split(",")(0)
          getPropertyValue(endpointData, "hdfs-site", s"dfs.ha.namenodes.$internalNameService")  match {
            case Right(nameServicePrefixes) => {
              val endpointConfigs : Seq[String] = nameServicePrefixes.split(",").map((x) => s"dfs.namenode.$nameNodeScheme-address.$internalNameService.$x")
              val endpoints = for (config <- endpointConfigs) yield getPropertyValue(endpointData, "hdfs-site", config)
              val nameNodeHostEndpoints : Seq[String] = endpoints.filter(_.isRight).map(_.right.get)
              val namenodeHostEndpoint : Option[String] = nameNodeHostEndpoints.find((x) => new java.net.URI(s"$nameNodeScheme://$x").getHost == namenodeHostName)
              val errorMsg = DataplaneService.nameNodeEndpointErrMsg + namenodeHostName
              if (namenodeHostEndpoint.isDefined) Right(namenodeHostEndpoint.get) else  Left(Errors(Seq(Error(BAD_GATEWAY.toString, errorMsg))))
            }
            case Left(errors) => Left(errors)
          }
        }
        case Left(errors) => Left(errors)
      }
    } else {
      getPropertyValue(endpointData, "hdfs-site", nameNodeSchemePortMap(nameNodeScheme))
    }
    
    endpoint match {
      case Right(endpoint) => {
        val namenodePort = new java.net.URI(s"$nameNodeScheme://$endpoint").getPort
        val fullurl = s"$nameNodeScheme://$namenodeHostName:$namenodePort"
        val servicePropertiesMap = Map("url" -> Some(fullurl))
        Right(
          ClusterServiceEndpointDetails(endpointData.serviceid,
                                        endpointData.servicename,
                                        endpointData.clusterid,
                                        namenodeHostName,
                                        servicePropertiesMap))
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
    val hiveServerZkQuorum: Either[Errors, String] =
      getPropertyValue(endpointData, "hive-site", "hive.zookeeper.quorum")
    val hiveServerZkNameSpace: Either[Errors, String] =
      getPropertyValue(endpointData, "hive-site", "hive.server2.zookeeper.namespace")

    hiveServerZkQuorum match {
      case Right(hiveServerZkQuorum) => {
        hiveServerZkNameSpace match {
          case Right(hiveServerZkNameSpace) =>  {
            val hiveServerHostName = endpointData.servicehost
            val hsEndpoint = s"jdbc:hive2://$hiveServerZkQuorum/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=$hiveServerZkNameSpace"

            val hsKerberosPrincipal: Option[String] =  getPropertyValue(endpointData, "hive-site", "hive.server2.authentication.kerberos.principal") match {
              case Left(errors) => Some("hive/_HOST@EXAMPLE.COM")
              case Right(hsKerberosPrincipal) => Some(hsKerberosPrincipal)
            }

            val hiveServiceConfigMap : Map[String, Option[String]] = Map(
              "hsEndpoint" -> Some(hsEndpoint),
              "hsKerberosPrincipal" -> hsKerberosPrincipal
            )

            Right(
              ClusterServiceEndpointDetails(
                endpointData.serviceid,
                endpointData.servicename,
                endpointData.clusterid,
                hiveServerHostName,
                hiveServiceConfigMap))
          }
          case Left(errors) => Left(errors)
        }
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
        val errorMsg = s"configuration blob is not available for $serviceName"
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
    * @param clusterId cluster id
    * @return
    */
  def getDpCluster(clusterId: Long): Future[Either[Errors, DataplaneCluster]] = {
    dpClusterService.retrieve(clusterId.toString)
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
    : Future[Either[Errors, String]] = {
    getServiceEndpoint(clusterId,
                              DataplaneService.BEACON_SERVER,
                              getBeaconEndpoint)
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

  /**
    * Get future for service details from dataplane
    * @param clusterId cluster id
    * @return
    */
  def getServiceEndpoint(clusterId: Long, serviceName: String, f: ClusterServiceWithConfigs => Either[Errors,
                         String]): Future[Either[Errors, String]] = {
    val p: Promise[Either[Errors, String]] = Promise()
    clusterComponentService
      .getEndpointsForCluster(clusterId, serviceName)
      .map({
        case Right(clusterServiceWithConfigs) => {
          val serviceEndpoint: Either[Errors, String] =
            f(clusterServiceWithConfigs)
          serviceEndpoint match {
            case Right(serviceEndpoint) => p.success(Right(serviceEndpoint))
            case Left(errors) => p.success(Left(errors))
          }
        }
        case Left(errors) => p.success(Left(errors))
      })
    p.future
  }

  def getServiceConfigs(clusterId: Long,
                        serviceName: String): Future[Either[Errors, ClusterServiceWithConfigs]] = {
    clusterComponentService
      .getEndpointsForCluster(clusterId, serviceName)
  }
}

object DataplaneService {
  val BEACON_SERVER = "BEACON"
  val NAMENODE = "NAMENODE"
  val HIVE_SERVER = "HIVE"

  def nameNodeEndpointErrMsg = "NameNode address config with active namenode hostname in the key not found: "
}
