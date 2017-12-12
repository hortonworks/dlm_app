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
import com.hortonworks.dataplane.cs.Webservice.{
  AmbariWebService => AmbariClientService
}
import com.hortonworks.dataplane.commons.domain.Entities.{
  Error,
  Errors,
  HJwtToken
}
import com.hortonworks.dlm.beacon.domain.RequestEntities.RangerServiceDetails
import models.Ambari
import models.Entities.{YarnQueueDefinition, YarnQueuesResponse}
import play.api.Logger
import play.api.http.Status.BAD_GATEWAY
import play.api.libs.json.{JsObject, JsValue}
import utils.StringExtensions._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

/**
  *
  * @param ambariService ambari service to execute ambari REST apis
  */
@Singleton
class AmbariService @Inject()(
    @Named("ambariService") val ambariService: AmbariClientService,
    val dataplaneService: DataplaneService) {

  /**
    * Get health status of the cluster
    *
    * @param clusterId cluster id
    * @param token     Jwt token
    * @return
    */
  def getClusterHealthStatus(clusterId: Long)(
      implicit token: Option[HJwtToken]): Future[Either[Errors, JsValue]] = {
    val p: Promise[Either[Errors, JsValue]] = Promise()

    dataplaneService.getCluster(clusterId).map {
      case Left(errors) => p.success(Left(errors))
      case Right(response) =>
        val clusterName = response.name
        val url =
          s"clusters/$clusterName/services?ServiceInfo/service_name.in(HDFS,BEACON,KNOX,HIVE,YARN)&fields=ServiceInfo/state&minimal_response=true"
        ambariService.requestAmbariApi(clusterId, url.encode).map {
          case Left(errors) => p.success(Left(errors))
          case Right(res)   => p.success(Right(res))
        }
    }
    p.future
  }

  /**
    * Get health status of all clusters
    *
    * @param token JWT token
    * @return
    */
  def getAllClusterHealthStatus()(implicit token: Option[HJwtToken])
    : Future[Either[Seq[Errors], Seq[JsValue]]] = {
    val p: Promise[Either[Seq[Errors], Seq[JsValue]]] = Promise()

    dataplaneService.getAllClusters.map {
      case Left(errors) => p.success(Left(List(errors)))
      case Right(dataplaneClusters) =>
        val allClusterStatusFuture: Future[Seq[Either[Errors, JsValue]]] =
          Future.sequence(dataplaneClusters.map((cluster) => {
            val clusterName = cluster.name
            val clusterId = cluster.id.get
            val url =
              s"clusters/$clusterName/services?ServiceInfo/service_name.in(HDFS,BEACON,KNOX,HIVE,YARN)&fields=ServiceInfo/state&minimal_response=true"
            ambariService.requestAmbariApi(clusterId,
                                           url.encode,
                                           addClusterIdToResponse = true)
          }))

        allClusterStatusFuture.map { allClusterStatus =>
          {
            val clusterStatuses =
              allClusterStatus.filter(_.isRight).map(_.right.get)
            val failedAmbariApis =
              allClusterStatus.filter(_.isLeft).map(_.left.get)
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
    * Get the active (effective) service configuration for the default group of a service
    *
    * @param clusterId   cluster id
    * @param serviceName service name
    * @param token       JWT token
    * @return
    */
  def getActiveServiceConfiguration(clusterId: Long, serviceName: String)(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, Seq[ActiveServiceConfigurations]]] = {
    val p: Promise[Either[Errors, Seq[ActiveServiceConfigurations]]] = Promise()
    dataplaneService.getCluster(clusterId).map {
      case Left(errors) =>
        p.success(Left(errors))
      case Right(response) =>
        val clusterName = response.name
        val url = AmbariService.getActiveServiceConfigurationUrl(clusterName,
                                                                 serviceName)
        ambariService.requestAmbariApi(clusterId, url.encode).map {
          case Left(errors) =>
            p.success(Left(errors))
          case Right(res) =>
            p.success(Right(res.validate[ActiveDefaultConfiguration].get.items))
        }
    }
    p.future
  }

  /**
    * Get ranger endpoint details to be submitted as part of cluster submission to beacon
    *
    * @param clusterId cluster id
    * @param token     JWT token
    * @return
    */
  def getRangerEndpointDetails(clusterId: Long)(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, Option[RangerServiceDetails]]] = {
    val p: Promise[Either[Errors, Option[RangerServiceDetails]]] = Promise()
    val rangerConfigurations
      : Future[Either[Errors, Seq[ActiveServiceConfigurations]]] =
      getActiveServiceConfiguration(clusterId,
                                    AmbariService.RANGER_SERVICE_NAME)

    rangerConfigurations.map {
      case Left(errors) => p.success(Left(errors))
      case Right(response) =>
        if (response.isEmpty) p.success(Right(None))
        else {
          val configurations: Seq[ServiceConfigurations] =
            response.head.configurations
          val adminProperties: Option[ServiceConfigurations] =
            configurations.find(x =>
              x.`type` == AmbariService.RANGER_ADMIN_PROPERTIES)
          adminProperties match {
            case None =>
              p.success(
                Left(Errors(Seq(Error(BAD_GATEWAY.toString,
                                      AmbariService.adminPropertiesErrorMsg)))))
            case Some(ap) =>
              ap.properties.as[RangerProperties].policymgr_external_url match {
                case None =>
                  p.success(
                    Left(
                      Errors(Seq(Error(BAD_GATEWAY.toString,
                                       AmbariService.policymgrUrlErrorMsg)))))
                case Some(policymgr_external_url) =>
                  val clusterName = ap.Config.cluster_name

                  for {
                    hdfsConfigurations <- getActiveServiceConfiguration(
                      clusterId,
                      AmbariService.HDFS_SERVICE_NAME)
                    hiveConfigurations <- getActiveServiceConfiguration(
                      clusterId,
                      AmbariService.HIVE_SERVICE_NAME)
                  } yield {
                    val futureList =
                      List(hdfsConfigurations, hiveConfigurations)
                    if (futureList.exists(_.isLeft)) {
                      p.success(
                        Left(Errors(
                          Seq(Error(BAD_GATEWAY.toString,
                                    AmbariService.rangerPolicyNameErrorMsg)))))
                    } else {
                      val rangerHdfsSecurityConfigs
                        : Option[ServiceConfigurations] =
                        hdfsConfigurations.right.get.head.configurations
                          .find(x =>
                            x.`type` == AmbariService.RANGER_HDFS_SECURITY_PROPERTIES)
                      val rangerHDFSServiceName =
                        rangerHdfsSecurityConfigs match {
                          case None => s"${clusterName}_hadoop"
                          case Some(rhsc) =>
                            rhsc.properties
                              .as[RangerProperties]
                              .`ranger.plugin.hdfs.service.name` match {
                              case None => s"${clusterName}_hadoop"
                              case Some(rangerHDFSServiceNameValue) =>
                                if (rangerHDFSServiceNameValue != "{{repo_name}}")
                                  rangerHDFSServiceNameValue
                                else
                                  s"${clusterName}_hadoop"
                            }
                        }

                      val rangerHiveServiceName: Option[String] =
                        if (hiveConfigurations.right.get.isEmpty) None
                        else {
                          val rangerHiveSecurityConfigs
                            : Option[ServiceConfigurations] =
                            hiveConfigurations.right.get.head.configurations
                              .find(x =>
                                x.`type` == AmbariService.RANGER_HIVE_SECURITY_PROPERTIES)
                          rangerHiveSecurityConfigs match {
                            case None => Some(s"${clusterName}_hive")
                            case Some(rhsc) =>
                              rhsc.properties
                                .as[RangerProperties]
                                .`ranger.plugin.hdfs.service.name` match {
                                case None => Some(s"${clusterName}_hive")
                                case Some(rangerHiveServiceNameValue) =>
                                  if (rangerHiveServiceNameValue != "{{repo_name}}")
                                    Some(rangerHiveServiceNameValue)
                                  else
                                    Some(s"${clusterName}_hive")
                              }
                          }
                        }
                      p.success(
                        Right(
                          Some(
                            RangerServiceDetails(policymgr_external_url,
                                                 rangerHDFSServiceName,
                                                 rangerHiveServiceName))))
                    }
                  }

              }
          }

        }
    }
    p.future
  }

  /**
    * Get HDFS config details for cluster submission to beacon
    *
    * @param clusterId cluster id
    * @return
    */
  def getHDFSConfigDetails(clusterId: Long)(implicit token: Option[HJwtToken])
    : Future[Either[Errors, Map[String, Option[String]]]] = {
    val p: Promise[Either[Errors, Map[String, Option[String]]]] = Promise()
    getServiceConfigDetails(clusterId, AmbariService.HDFS_SERVICE_NAME).map {
      case Left(errors) => p.success(Left(errors))
      case Right(response) =>
        response match {
          case None => p.success(Right(Map()))
          case Some(res) =>
            val fsEndpoint: Either[Errors, String] =
              getPropertyValue(res,
                               AmbariService.HDFS_SERVICE_NAME,
                               "core-site",
                               "fs.defaultFS")
            fsEndpoint match {
              case Right(fse) =>
                val nnKerberosPrincipal: Option[String] = convertEitherToOption(
                  getPropertyValue(res,
                                   AmbariService.HDFS_SERVICE_NAME,
                                   "hdfs-site",
                                   "dfs.namenode.kerberos.principal"))

                val dfsNameService: Option[String] = convertEitherToOption(
                  getPropertyValue(res,
                                   AmbariService.HDFS_SERVICE_NAME,
                                   "hdfs-site",
                                   "dfs.nameservices"))
                val dfsInternalNameServices: Option[String] =
                  convertEitherToOption(
                    getPropertyValue(res,
                                     AmbariService.HDFS_SERVICE_NAME,
                                     "hdfs-site",
                                     "dfs.internal.nameservices"))
                val nnHaDynamicKeyConfigs: Map[String, Option[String]] =
                  dfsInternalNameServices match {
                    case Some(nameService) =>
                      val internalNameService = nameService.split(",")(0)
                      val dfsHaNnPrefixValue = convertEitherToOption(
                        getPropertyValue(
                          res,
                          AmbariService.HDFS_SERVICE_NAME,
                          "hdfs-site",
                          s"dfs.ha.namenodes.$internalNameService"))
                      dfsHaNnPrefixValue match {
                        case Some(dfsHaNnPrefixVal) =>
                          val endpointConfigs: Seq[String] = dfsHaNnPrefixVal
                            .split(",")
                            .map((x) =>
                              s"dfs.namenode.rpc-address.$internalNameService.$x")
                          val nnHaConfigs = endpointConfigs :+ s"dfs.client.failover.proxy.provider.$internalNameService"
                          Map(
                            s"dfs.ha.namenodes.$internalNameService" -> Some(
                              dfsHaNnPrefixVal)) ++
                            nnHaConfigs.foldLeft(
                              Map(): Map[String, Option[String]]) {
                              (acc, next) =>
                                {
                                  val nextConfigValue: Option[String] =
                                    convertEitherToOption(
                                      getPropertyValue(
                                        res,
                                        AmbariService.HDFS_SERVICE_NAME,
                                        "hdfs-site",
                                        next))
                                  acc + (next -> nextConfigValue)
                                }
                            }
                        case None => Map()
                      }
                    case None => Map()
                  }

                val hdfsServiceConfigMap: Map[String, Option[String]] = Map(
                  "fsEndpoint" -> Some(fse),
                  "dfs.namenode.kerberos.principal" -> nnKerberosPrincipal,
                  "dfs.nameservices" -> dfsNameService
                ) ++ nnHaDynamicKeyConfigs

                p.success(Right(hdfsServiceConfigMap))
              case Left(errors) => p.success(Left(errors))
            }
        }
    }
    p.future
  }

  /**
    * Get hive server2 config details for cluster submission to beacon
    *
    * @param clusterId cluster id
    * @return
    */
  def getHiveConfigDetails(clusterId: Long)(implicit token: Option[HJwtToken])
    : Future[Either[Errors, Map[String, Option[String]]]] = {
    val p: Promise[Either[Errors, Map[String, Option[String]]]] = Promise()
    getServiceConfigDetails(clusterId, AmbariService.HIVE_SERVICE_NAME).map {
      case Left(errors) => p.success(Left(errors))
      case Right(response) =>
        response match {
          case None => p.success(Right(Map()))
          case Some(res) =>
            val hiveServerZkQuorum: Either[Errors, String] =
              getPropertyValue(res,
                               AmbariService.HIVE_SERVICE_NAME,
                               "hive-site",
                               "hive.zookeeper.quorum")
            val hiveServerZkNameSpace: Either[Errors, String] =
              getPropertyValue(res,
                               AmbariService.HIVE_SERVICE_NAME,
                               "hive-site",
                               "hive.server2.zookeeper.namespace")

            hiveServerZkQuorum match {
              case Right(hszkq) =>
                hiveServerZkNameSpace match {
                  case Right(hszkns) =>
                    val hsEndpoint =
                      s"jdbc:hive2://$hszkq/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=$hszkns"

                    val hsKerberosPrincipal: Option[String] =
                      convertEitherToOption(
                        getPropertyValue(
                          res,
                          AmbariService.HIVE_SERVICE_NAME,
                          "hive-site",
                          "hive.server2.authentication.kerberos.principal"))

                    val hiveServiceConfigMap: Map[String, Option[String]] = Map(
                      "hsEndpoint" -> Some(hsEndpoint),
                      "hive.server2.authentication.kerberos.principal" -> hsKerberosPrincipal
                    )

                    p.success(Right(hiveServiceConfigMap))
                  case Left(errors) => p.success(Left(errors))
                }
              case Left(errors) => p.success(Left(errors))
            }
        }
    }
    p.future
  }

  def getCapacitySchedulerConfigs(clusterId: Long)(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, Ambari.ServiceConfigurations]] = {
    val p: Promise[Either[Errors, Ambari.ServiceConfigurations]] = Promise()
    val configError = Errors(Seq(Error("500", "no configs")))

    getServiceConfigDetails(clusterId, AmbariService.YARN_SERVICE_NAME).map {
      case Left(errors) => p.success(Left(errors))
      case Right(response) =>
        response match {
          case None => p.success(Left(configError))
          case Some(res) =>
            val capacitySchedulerProps = res.find(
              _.`type` == AmbariService.YARN_CAPACITY_SCHEDULER_PROPERTIES)
            capacitySchedulerProps match {
              case None          => p.success(Left(configError))
              case Some(configs) => p.success(Right(configs))
            }
        }
    }
    p.future
  }

  private def buildQueues(path: String,
                          queues: Map[String, String]): YarnQueueDefinition = {
    val name = path.split("\\.").lastOption.get
    queues.get(path) match {
      case None => YarnQueueDefinition(name, Seq(), path)
      case Some(children) =>
        val childrenQueues: Seq[YarnQueueDefinition] = children
          .split(",")
          .map(n => buildQueues(s"$path.$n", queues))
        YarnQueueDefinition(name, childrenQueues, path)
    }
  }

  private def extractYarnQueues(
      configs: Ambari.ServiceConfigurations): Seq[YarnQueueDefinition] = {
    val queuePattern = "yarn.scheduler.capacity.(.+).queues$$".r
    val queueConfigs = configs.properties
      .as[Map[String, String]]
      .foldLeft(Map[String, String]()) {
        case (acc, (k: String, v: String)) =>
          k match {
            case queuePattern(name) => acc ++ Map(name -> v)
            case _                  => acc
          }
      }
    Seq(buildQueues("root", queueConfigs))
  }

  def getYarnQueues(clusterId: Long)(implicit token: Option[HJwtToken])
    : Future[Either[Errors, YarnQueuesResponse]] = {
    val p: Promise[Either[Errors, YarnQueuesResponse]] = Promise()

    getCapacitySchedulerConfigs(clusterId).map {
      case Left(errors) => p.success(Left(errors))
      case Right(capacitySchedulerConfigs) =>
        val extracted = extractYarnQueues(capacitySchedulerConfigs)
        p.success(Right(YarnQueuesResponse(extracted)))
    }
    p.future
  }

  def convertEitherToOption[T](data: Either[Errors, T]): Option[T] = {
    data match {
      case Right(x) => Some(x)
      case Left(_)  => None
    }
  }

  /**
    * Get active service configuration for a service
    *
    * @param clusterId   cluster id
    * @param serviceName service name
    * @param token       JWT token
    * @return
    */
  def getServiceConfigDetails(clusterId: Long, serviceName: String)(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, Option[Seq[ServiceConfigurations]]]] = {
    val p: Promise[Either[Errors, Option[Seq[ServiceConfigurations]]]] =
      Promise()
    val serviceConfigurations
      : Future[Either[Errors, Seq[ActiveServiceConfigurations]]] =
      getActiveServiceConfiguration(clusterId, serviceName)
    serviceConfigurations.map {
      case Left(errors) => p.success(Left(errors))
      case Right(response) =>
        if (response.isEmpty) p.success(Right(None))
        else {
          val configurations: Seq[ServiceConfigurations] =
            response.head.configurations
          p.success(Right(Some(configurations)))
        }
    }
    p.future
  }

  /**
    *
    * @param serviceConfigurations configuration blob
    * @param serviceName           service name
    * @param configType            config type
    * @param configName            config property name
    * @return
    */
  def getPropertyValue(serviceConfigurations: Seq[ServiceConfigurations],
                       serviceName: String,
                       configType: String,
                       configName: String): Either[Errors, String] = {
    val configTypeProperties =
      serviceConfigurations.find(_.`type` == configType)
    configTypeProperties match {
      case Some(ctp) =>
        ctp.properties.as[JsObject].value.get(configName) match {
          case Some(configValue) => Right(configValue.as[String])
          case None =>
            val errorMsg =
              s"$configName is not found in $configType for $serviceName"
            Logger.error(errorMsg)
            Left(Errors(Seq(Error("500", errorMsg))))
        }
      case None =>
        val errorMsg = s"$configType is not associated with $serviceName"
        Logger.error(errorMsg)
        Left(Errors(Seq(Error("500", errorMsg))))
    }

  }
}

object AmbariService {
  lazy val RANGER_SERVICE_NAME = "RANGER"
  lazy val HDFS_SERVICE_NAME = "HDFS"
  lazy val HIVE_SERVICE_NAME = "HIVE"
  lazy val YARN_SERVICE_NAME = "YARN"
  lazy val RANGER_ADMIN_PROPERTIES = "admin-properties"
  lazy val RANGER_HDFS_SECURITY_PROPERTIES = "ranger-hdfs-security"
  lazy val RANGER_HIVE_SECURITY_PROPERTIES = "ranger-hive-security"
  lazy val YARN_CAPACITY_SCHEDULER_PROPERTIES = "capacity-scheduler"

  def getNameNodeAmbariUrl =
    "services/HDFS/components/NAMENODE?fields=host_components/metrics/dfs/FSNamesystem/HAState,host_components/HostRoles/host_name&minimal_response=true"

  def getActiveNameNodeErrMsg = "No active namenode found from Ambari REST APIs"

  def getActiveServiceConfigurationUrl(clusterName: String,
                                       serviceName: String): String =
    s"clusters/$clusterName/configurations/" +
      s"service_config_versions?service_name=$serviceName&is_current=true&group_name=Default"

  def adminPropertiesErrorMsg =
    "admin-properties configuration type is not found for Ranger service"

  def policymgrUrlErrorMsg =
    "admin-properties configuration type for Ranger service does not have policymgr_external_url property"

  def rangerPolicyNameErrorMsg =
    "Error getting current HDFS/HIVE service configuration from Ambari"
}
