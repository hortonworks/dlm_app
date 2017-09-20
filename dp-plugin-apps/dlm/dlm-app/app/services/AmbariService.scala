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
import models.Ambari._
import com.hortonworks.dataplane.cs.Webservice.{AmbariWebService => AmbariClientService}
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken}
import com.hortonworks.dlm.beacon.domain.RequestEntities.RangerServiceDetails
import models.Entities.ClusterServiceEndpointDetails
import play.api.Logger
import play.api.http.Status.BAD_GATEWAY
import play.api.libs.json.JsValue
import utils.StringExtensions._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

/**
  *
  * @param ambariService         ambari service to execute ambari REST apis
  */
@Singleton
class AmbariService @Inject()(@Named("ambariService") val ambariService: AmbariClientService,
                              val dataplaneService: DataplaneService) {

  /**
    * Get hive databases using auto hive20 instance
    * @param clusterId cluster id
    * @return
    */
  def getHiveDatabases(clusterId: Long)(implicit token:Option[HJwtToken]) : Future[Either[Errors, JsValue]] = {
    val url = "/views/HIVE/versions/2.0.0/instances/AUTO_HIVE20_INSTANCE/resources/ddl/databases"
    ambariService.requestAmbariApi(clusterId, url.encode)
  }

  /**
    * Get all tables for hive database using auto hive20 instance REST APIs
    * @param clusterId cluster id
    * @return
    */
  def getHiveDatabaseTables(clusterId: Long, dbName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors, JsValue]] = {
    val url = s"/views/HIVE/versions/2.0.0/instances/AUTO_HIVE20_INSTANCE/resources/ddl/databases/$dbName/tables"
    ambariService.requestAmbariApi(clusterId, url.encode)
  }

  /**
    * Get health status of the cluster
    * @param clusterId  cluster id
    * @param token      Jwt token
    * @return
    */
  def getClusterHealthStatus(clusterId: Long)(implicit token:Option[HJwtToken]) : Future[Either[Errors, JsValue]] = {
    val p: Promise[Either[Errors, JsValue]] = Promise()

    dataplaneService.getCluster(clusterId).map {
      case Left(errors) =>  p.success(Left(errors))
      case Right(response) =>
        val clusterName = response.name
        val url = s"clusters/$clusterName/services?ServiceInfo/service_name.in(HDFS,BEACON,KNOX)&fields=ServiceInfo/state&minimal_response=true"
        ambariService.requestAmbariApi(clusterId, url.encode).map {
        case Left(errors) =>  p.success(Left(errors))
        case Right(response) => p.success(Right(response))
      }
    }
    p.future
  }

  /**
    * Get health status of all clusters
    * @param token  JWT token
    * @return
    */
  def getAllClusterHealthStatus()(implicit token:Option[HJwtToken]) : Future[Either[Seq[Errors], Seq[JsValue]]] = {
    val p: Promise[Either[Seq[Errors], Seq[JsValue]]] = Promise()

    dataplaneService.getAllClusters.map {
      case Left(errors) =>  p.success(Left(List(errors)))
      case Right(dataplaneClusters) =>
        val allClusterStatusFuture: Future[Seq[Either[Errors, JsValue]]] = Future.sequence(dataplaneClusters.map((cluster) => {
          val clusterName = cluster.name
          val clusterId = cluster.id.get
          val url = s"clusters/$clusterName/services?ServiceInfo/service_name.in(HDFS,BEACON,KNOX,HIVE)&fields=ServiceInfo/state&minimal_response=true"
          ambariService.requestAmbariApi(clusterId, url.encode, true)
        }))

        allClusterStatusFuture.map {
          allClusterStatus => {
            val clusterStatuses  = allClusterStatus.filter(_.isRight).map(_.right.get)
            val failedAmbariApis =  allClusterStatus.filter(_.isLeft).map(_.left.get)
            if (failedAmbariApis.length == allClusterStatus.length) {
              p.success(Left(failedAmbariApis))
            } else {
              p.success(Right(clusterStatuses))
            }
          }
        }

    }
    p.future
  }

  /**
    *
    * @param clusterId  cluster id
    * @param token   JWT token
    * @return   (String, Boolean)
    *           ._1 = active namenode
    *           ._2 = Namenode HA enabled
    */
  def getActiveComponent(clusterId: Long)(implicit token:Option[HJwtToken]) : Future[Either[Errors, (String, Boolean)]] = {
    val p: Promise[Either[Errors, (String, Boolean)]] = Promise()

    dataplaneService.getCluster(clusterId).map {
      case Left(errors) =>  p.success(Left(errors))
      case Right(response) =>
        val clusterName = response.name
        val ambariApiSuffix = AmbariService.getNameNodeAmbariUrl
        val url = s"clusters/$clusterName/$ambariApiSuffix"
        ambariService.requestAmbariApi(clusterId, url.encode).map {
          case Left(errors) =>  p.success(Left(errors))
          case Right(response) => {
            val nameNodes : Seq[HostComponent] = response.validate[HostComponents].get.host_components
            val activeNameNode = nameNodes.find((x) => x.metrics.dfs.`FSNamesystem`.HAState == "active")
            activeNameNode match {
              case None => {
                val errorMsg = AmbariService.getActiveNameNodeErrMsg
                Logger.error(errorMsg)
                p.success(Left(Errors(Seq(Error(BAD_GATEWAY.toString, errorMsg)))))
              }
              case Some(activeNameNode) => p.success(Right(activeNameNode.HostRoles.host_name, nameNodes.size > 1))
            }
          }
        }
    }
    p.future
  }

  /**
    * Get the active (effective) service configuration for the default group of a service
    * @param clusterId     cluster id
    * @param serviceName   service name
    * @param token          JWT token
    * @return
    */
  def getActiveServiceConfiguration(clusterId: Long, serviceName: String) (implicit token:Option[HJwtToken]):
    Future[Either[Errors, Seq[ActiveServiceConfigurations]]] = {
    val p: Promise[Either[Errors, Seq[ActiveServiceConfigurations]]] = Promise()
    dataplaneService.getCluster(clusterId).map {
      case Left(errors) =>  {
        p.success(Left(errors))
      }
      case Right(response) =>
        val clusterName = response.name
        val url = AmbariService.getActiveServiceConfigurationUrl(clusterName, serviceName)
        ambariService.requestAmbariApi(clusterId, url.encode).map {
          case Left(errors) =>  {
            p.success(Left(errors))
          }
          case Right(response) => {
            p.success(Right(response.validate[ActiveDefaultConfiguration].get.items))
          }
        }
    }
    p.future
  }

  /**
    * Get ranger endpoint details to be submitted as part of cluster submission to beacon
    * @param clusterId  cluster id
    * @param token      JWT token
    * @return
    */
  def getRangerEndpointDetails(clusterId: Long) (implicit token:Option[HJwtToken]):
    Future[Either[Errors, Option[RangerServiceDetails]]] = {
    val p: Promise[Either[Errors, Option[RangerServiceDetails]]] = Promise()
    val rangerConfigurations : Future[Either[Errors, Seq[ActiveServiceConfigurations]]] =
      getActiveServiceConfiguration(clusterId, AmbariService.RANGER_SERVICE_NAME)

    rangerConfigurations.map {
      case Left(errors) =>  p.success(Left(errors))
      case Right(response) =>
        if (response.isEmpty) p.success(Right(None)) else {
          val configurations : Seq[ServiceConfigurations] = response.head.configurations
          val adminProperties : Option[ServiceConfigurations] = configurations.find(x => x.`type` == AmbariService.RANGER_ADMIN_PROPERTIES)
          adminProperties match {
            case None => p.success(Left(Errors(Seq(Error(BAD_GATEWAY.toString, AmbariService.adminPropertiesErrorMsg)))))
            case Some(adminProperties) => {
              adminProperties.properties.policymgr_external_url match {
                case None => p.success(Left(Errors(Seq(Error(BAD_GATEWAY.toString, AmbariService.policymgrUrlErrorMsg)))))
                case Some(policymgr_external_url) =>
                  val clusterName = adminProperties.Config.cluster_name

                  for {
                    hdfsConfigurations <- getActiveServiceConfiguration(clusterId, AmbariService.HDFS_SERVICE_NAME)
                    hiveConfigurations <- getActiveServiceConfiguration(clusterId, AmbariService.HIVE_SERVICE_NAME)
                  } yield {
                    val futureList = List(hdfsConfigurations, hiveConfigurations)
                    if (futureList.exists(_.isLeft)){
                      p.success(Left(Errors(Seq(Error(BAD_GATEWAY.toString, AmbariService.rangerPolicyNameErrorMsg)))))
                    } else {
                      val rangerHdfsSecurityConfigs : Option[ServiceConfigurations] = hdfsConfigurations.right.get.head.configurations
                          .find(x => x.`type` == AmbariService.RANGER_HDFS_SECURITY_PROPERTIES)
                      val rangerHDFSServiceName = rangerHdfsSecurityConfigs match {
                        case None => s"${clusterName}_hadoop"
                        case Some(rangerHdfsSecurityConfigs) =>
                          rangerHdfsSecurityConfigs.properties.`ranger.plugin.hdfs.service.name` match {
                            case None => s"${clusterName}_hadoop"
                            case Some(rangerHDFSServiceNameValue) =>
                              if (rangerHDFSServiceNameValue != "{{repo_name}}")
                                rangerHDFSServiceNameValue
                              else
                                s"${clusterName}_hadoop"
                          }
                      }

                      val rangerHiveServiceName : Option[String] = if (hiveConfigurations.right.get.isEmpty) None else {
                        val rangerHiveSecurityConfigs : Option[ServiceConfigurations] = hiveConfigurations.right.get.head.configurations
                          .find(x => x.`type` == AmbariService.RANGER_HIVE_SECURITY_PROPERTIES)
                        rangerHiveSecurityConfigs match {
                          case None => Some(s"${clusterName}_hive")
                          case Some(rangerHiveSecurityConfigs) =>
                            rangerHiveSecurityConfigs.properties.`ranger.plugin.hdfs.service.name` match {
                              case None => Some(s"${clusterName}_hive")
                              case Some(rangerHiveServiceNameValue) =>
                                if (rangerHiveServiceNameValue != "{{repo_name}}")
                                  Some(rangerHiveServiceNameValue)
                                else
                                  Some(s"${clusterName}_hive")
                            }
                        }
                      }
                      p.success(Right(Some(RangerServiceDetails(policymgr_external_url, rangerHDFSServiceName, rangerHiveServiceName))))
                    }
                  }

              }
            }
          }

        }
    }
    p.future
  }
}

object AmbariService {
  lazy val RANGER_SERVICE_NAME = "RANGER"
  lazy val HDFS_SERVICE_NAME = "HDFS"
  lazy val HIVE_SERVICE_NAME = "HIVE"
  lazy val RANGER_ADMIN_PROPERTIES = "admin-properties"
  lazy val RANGER_HDFS_SECURITY_PROPERTIES = "ranger-hdfs-security"
  lazy val RANGER_HIVE_SECURITY_PROPERTIES = "ranger-hive-security"

  def getNameNodeAmbariUrl = "services/HDFS/components/NAMENODE?fields=host_components/metrics/dfs/FSNamesystem/HAState,host_components/HostRoles/host_name&minimal_response=true"
  def getActiveNameNodeErrMsg = "No active namenode found from Ambari REST APIs"
  def getActiveServiceConfigurationUrl(clusterName: String, serviceName: String) = s"clusters/$clusterName/configurations/service_config_versions?service_name=$serviceName&is_current=true&group_name=Default"
  def adminPropertiesErrorMsg = "admin-properties configuration type is not found for Ranger service"
  def policymgrUrlErrorMsg = "admin-properties configuration type for Ranger service does not have policymgr_external_url property"
  def rangerPolicyNameErrorMsg = "Error getting current HDFS/HIVE service configuration from Ambari"
}

