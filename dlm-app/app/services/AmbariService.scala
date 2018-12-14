/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package services

import com.google.inject.{Inject, Singleton}
import com.google.inject.name.Named
import models.Ambari._
import com.hortonworks.dataplane.cs.Webservice.{AmbariWebService => AmbariClientService}
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken}
import com.hortonworks.dlm.beacon.domain.RequestEntities.{AtlasServiceDetails, RangerServiceDetails, SharedServicesDetails}
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconApiError, BeaconApiErrors}
import models.{Ambari, HiveFileSystemType}
import models.Entities._
import models.HiveFileSystemType.HiveFileSystemType
import play.api.Logger
import play.api.http.Status.{BAD_GATEWAY, INTERNAL_SERVER_ERROR}
import play.api.libs.json.{JsError, JsObject, JsSuccess, JsValue}
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
            if (allClusterStatus.nonEmpty && failedAmbariApis.lengthCompare(allClusterStatus.length) == 0) {
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
    * Get access priveleges for ambari of all clusters with regards to logged in user
    * @param userName
    * @param token
    * @return
    */
  def getUserPrivilegeForAllClusters(userName: String) (implicit token:Option[HJwtToken]) : Future[Either[Errors, Seq[AmbariUserReadPrivelege]]] = {
    val p: Promise[Either[Errors, Seq[AmbariUserReadPrivelege]]] = Promise()

    dataplaneService.getAllClusters.map {
      case Left(errors) => p.success(Left(errors))
      case Right(dataplaneClusters) =>
        val url = AmbariService.getUserPrivelegeUrl(userName)
        val viewConfigEnabled = true
        val allClusterAmbariUserFuture: Future[Seq[AmbariUserReadPrivelege]] =
          Future.sequence(dataplaneClusters.map(cluster => {
            val clusterId = cluster.id.get
            ambariService.requestAmbariApi(clusterId,
              url.encode,
              addClusterIdToResponse = true).map {
              case Left(error) => AmbariUserReadPrivelege(clusterId, !viewConfigEnabled)
              case Right(res) =>
                res.validate[AmbariUserInfo] match {
                case JsSuccess(result, _) => AmbariUserReadPrivelege(result.id, viewConfigEnabled)
                case JsError(error) => {
                  res.validate[AmbariUserWithMultiplePrivilegeInfo] match {
                    case JsSuccess(result, _) => AmbariUserReadPrivelege(clusterId, viewConfigEnabled)
                    case JsError(error) =>  AmbariUserReadPrivelege(clusterId, !viewConfigEnabled)
                  }
                }
              }
            }
          }))

        allClusterAmbariUserFuture.map {
            allClusterAmbariUsers => p.success(Right(allClusterAmbariUsers))
          }
    }
    p.future
  }


  /**
    * For all beacon clusters, Get current value for all configs that are posted to cluster definition
    *
    * @return
    */
  def getAllBeaconClusterConfigDetails()(implicit token: Option[HJwtToken])
  : Future[Either[DlmApiErrors, BeaconClusterConfig]] = {
    val p: Promise[Either[DlmApiErrors, BeaconClusterConfig]] = Promise()
    dataplaneService.getBeaconClusters.map {
      case Left(errors) => p.success(Left(DlmApiErrors(Seq(BeaconApiErrors(INTERNAL_SERVER_ERROR, None,
        Some(errors.errors.map(x => BeaconApiError(x.message)).head))))))
      case Right(beaconCluster) =>
        val beaconClusters = beaconCluster.clusters
        Future.sequence(beaconClusters.map((x) => getBeaconClusterConfigDetails(x.id))).map({
          allBeaconClustersConfigDetials =>
            val beaconClustersConfigDetials: Seq[BeaconClusterConfigDetials] = allBeaconClustersConfigDetials.filter(_.isRight).map(_.right.get)
            val failedResponses: Seq[BeaconApiErrors] = allBeaconClustersConfigDetials.filter(_.isLeft).map(_.left.get)
            if (failedResponses.lengthCompare(allBeaconClustersConfigDetials.length) == 0) {
              p.success(Left(DlmApiErrors(failedResponses)))
            } else {
              p.success(Right(BeaconClusterConfig(failedResponses, beaconClustersConfigDetials)))
            }
        })
    }
    p.future
  }


  /**
    * Get current value for all configs posted to beacon cluster definition
    *
    * @param clusterId cluster id
    * @return
    */
  def getBeaconClusterConfigDetails(clusterId: Long)(implicit token: Option[HJwtToken])
  : Future[Either[BeaconApiErrors, BeaconClusterConfigDetials]] = {
    val p: Promise[Either[BeaconApiErrors, BeaconClusterConfigDetials]] = Promise()
    for {
      clusterFs <- getHDFSConfigDetails(clusterId)
      hiveService <- getHiveConfigDetails(clusterId)
      sharedConfigs <- getSharedServicesDetails(clusterId)
    } yield {
      val futureFailedList = List(clusterFs, hiveService, sharedConfigs).filter(_.isLeft)
      if (futureFailedList.isEmpty) {
        val underlyingHiveFs : Option[HiveFileSystemType] = hiveService.right.get.getOrElse("hive.metastore.warehouse.dir", None) match {
          case None => None
          case Some(value) =>
            if (value.startsWith("s3a://")) {
              Some(HiveFileSystemType.S3)
            } else if (value.startsWith("wasb://")) {
              Some(HiveFileSystemType.WASB)
            } else if (value.startsWith("gs://")) {
              Some(HiveFileSystemType.GCS)
            } else {
              Some(HiveFileSystemType.HDFS)
            }
          }
        val atlasConfigs = sharedConfigs.right.get.atlasServiceDetails match {
          case None => Map()
          case Some(atlasServiceDetails) => Map(
            "atlasEndpoint" -> Some(atlasServiceDetails.atlasEndpoint),
            "atlas.sso.knox.providerurl" -> atlasServiceDetails.`atlas.sso.knox.providerurl`,
            "atlas.authentication.method.kerberos" -> atlasServiceDetails.`atlas.authentication.method.kerberos`
          )
        }
        val rangerConfigs = sharedConfigs.right.get.rangerServiceDetails match {
          case None => Map()
          case Some(rangerServiceDetails) => Map(
            "rangerEndPoint" -> Some(rangerServiceDetails.rangerEndPoint),
            "rangerHDFSServiceName" -> rangerServiceDetails.rangerHDFSServiceName,
            "rangerHIVEServiceName" -> rangerServiceDetails.rangerHIVEServiceName
          )
        }
        val configs = hiveService.right.get ++ clusterFs.right.get ++ atlasConfigs ++ rangerConfigs
        val filteredConfigs: Map[String,String] = configs.filter(x => x._2.isDefined) mapValues(_.get)
        val beaconClusterConfigDetails = BeaconClusterConfigDetials(clusterId, underlyingHiveFs, filteredConfigs)
        p.success(Right(beaconClusterConfigDetails))
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
          case Left(errors) => p.success(Left(errors))
          case Right(res) =>
            res.validate[ActiveDefaultConfiguration] match {
              case JsSuccess(result, _) => p.success(Right(result.items))
              case JsError(error) => p.success(Left(Errors(List(Error(BAD_GATEWAY,error.toString())))))
            }
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
  def getSharedServicesDetails(clusterId: Long)(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, SharedServicesDetails]] = {
    val p: Promise[Either[Errors, SharedServicesDetails]] = Promise()
    val sharedServicesConfig
      : Future[Either[Errors, Option[Seq[ServiceConfigurations]]]] =
      getServiceConfigDetails(clusterId,
                                    List(AmbariService.RANGER_SERVICE_NAME,AmbariService.ATLAS_SERVICE_NAME))

    sharedServicesConfig.map {
      case Left(errors) => p.success(Left(errors))
      case Right(res) =>
        res match {
          case None => p.success(Right(SharedServicesDetails(None, None)))
          case Some(response) => {
            val atlasDetails = getAtlasConfigs(response)
            val adminProperties: Option[ServiceConfigurations] =
              response.find(x =>
                x.`type` == AmbariService.RANGER_ADMIN_PROPERTIES)
            adminProperties match {
              case None =>
                p.success(Right(SharedServicesDetails(None, atlasDetails)))
              case Some(ap) =>
                ap.properties.as[RangerProperties].policymgr_external_url match {
                  case None =>
                    p.success(
                      Left(
                        Errors(Seq(Error(BAD_GATEWAY,
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
                            Seq(Error(BAD_GATEWAY,
                              AmbariService.rangerPolicyNameErrorMsg)))))
                      } else {
                        val rangerHDFSServiceName : Option[String] =
                          if (hdfsConfigurations.right.get.isEmpty) None
                          else {
                            val rangerHdfsSecurityConfigs
                            : Option[ServiceConfigurations] =
                              hdfsConfigurations.right.get.head.configurations
                                .find(x =>
                                  x.`type` == AmbariService.RANGER_HDFS_SECURITY_PROPERTIES)
                            rangerHdfsSecurityConfigs match {
                              case None => Some(s"${clusterName}_hadoop")
                              case Some(rhsc) =>
                                rhsc.properties
                                  .as[RangerProperties]
                                  .`ranger.plugin.hdfs.service.name` match {
                                  case None => Some(s"${clusterName}_hadoop")
                                  case Some(rangerHDFSServiceNameValue) =>
                                    if (rangerHDFSServiceNameValue != "{{repo_name}}")
                                      Some(rangerHDFSServiceNameValue)
                                    else
                                      Some(s"${clusterName}_hadoop")
                                }
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
                                  .`ranger.plugin.hive.service.name` match {
                                  case None => Some(s"${clusterName}_hive")
                                  case Some(rangerHiveServiceNameValue) =>
                                    if (rangerHiveServiceNameValue != "{{repo_name}}")
                                      Some(rangerHiveServiceNameValue)
                                    else
                                      Some(s"${clusterName}_hive")
                                }
                            }
                          }
                        val rangerServiceDetails = Some(RangerServiceDetails(policymgr_external_url,
                          rangerHDFSServiceName,
                          rangerHiveServiceName))
                        val sharedServicesDetails = SharedServicesDetails(rangerServiceDetails, atlasDetails)
                        p.success(Right(sharedServicesDetails))
                      }
                    }

                }
            }
          }
        }
    }
    p.future
  }


  def getAtlasConfigs(serviceConfigurations: Seq[ServiceConfigurations]) : Option[AtlasServiceDetails] = {
    val atlasProperties: Option[ServiceConfigurations] =
      serviceConfigurations.find(x =>
        x.`type` == AmbariService.ATLAS_PROPERTIES)

    atlasProperties match {
      case None => None
      case Some(ap) =>
        val atlasEndpoint = ap.properties.as[AtlasProperties].`atlas.rest.address`
        val atlasAuthentication = ap.properties.as[AtlasProperties].`atlas.authentication.method.kerberos`
        val atlasKnoxUrl = ap.properties.as[AtlasProperties].`atlas.sso.knox.providerurl`
        Some(AtlasServiceDetails(atlasEndpoint.get, atlasAuthentication, atlasKnoxUrl))
    }

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
    getServiceConfigDetails(clusterId, List(AmbariService.HDFS_SERVICE_NAME)).map {
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
                val nameNodeEndpointPrefix = Seq("rpc-address","http-address","https-address")
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
                            .flatMap(nameNodeLogicalName =>
                              nameNodeEndpointPrefix.map(prefix => s"dfs.namenode.$prefix.$internalNameService.$nameNodeLogicalName"))
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
                  "dfs.nameservices" -> dfsNameService,
                  "dfs.internal.nameservices" -> dfsInternalNameServices
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
    val configOfServices = List(AmbariService.HIVE_SERVICE_NAME, AmbariService.HDFS_SERVICE_NAME)
    getServiceConfigDetails(clusterId, configOfServices).map {
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

                    val hiveMetastoreUris: Option[String] =
                      convertEitherToOption(
                        getPropertyValue(
                          res,
                          AmbariService.HIVE_SERVICE_NAME,
                          "hive-site",
                          "hive.metastore.uris"))
                    val hiveDmlEvents: Option[String] = convertEitherToOption(
                      getPropertyValue(
                        res,
                        AmbariService.HIVE_SERVICE_NAME,
                        "hive-site",
                        "hive.metastore.dml.events"))


                    val hiveServiceKerberosConfigMap: Map[String, Option[String]] = getHiveSecurityConfigs(res)
                    val hiveSCloudEncryptionConfigMap: Map[String, Option[String]] = getCloudEncryptionConfigs(res)

                    var hiveServiceConfigMap: Map[String, Option[String]] = Map(
                      "hsEndpoint" -> Some(hsEndpoint),
                      "hive.metastore.uris" -> hiveMetastoreUris,
                      "hive.metastore.dml.events" -> hiveDmlEvents
                    )
                    hiveServiceConfigMap = hiveServiceConfigMap ++ hiveServiceKerberosConfigMap ++ hiveSCloudEncryptionConfigMap

                    p.success(Right(hiveServiceConfigMap))
                  case Left(errors) => p.success(Left(errors))
                }
              case Left(errors) => p.success(Left(errors))
            }
        }
    }
    p.future
  }

  def getHiveSecurityConfigs(serviceConfigs: Seq[ServiceConfigurations]): Map[String, Option[String]] = {

    val hsKerberosPrincipal: Option[String] =
      convertEitherToOption(
        getPropertyValue(
          serviceConfigs,
          AmbariService.HIVE_SERVICE_NAME,
          "hive-site",
          "hive.server2.authentication.kerberos.principal"))

    val hmsKerberosPrincipal: Option[String] =
      convertEitherToOption(
        getPropertyValue(
          serviceConfigs,
          AmbariService.HIVE_SERVICE_NAME,
          "hive-site",
          "hive.metastore.kerberos.principal"))

    val hiveServer2Authentication: Option[String] =
      convertEitherToOption(
        getPropertyValue(
          serviceConfigs,
          AmbariService.HIVE_SERVICE_NAME,
          "hive-site",
          "hive.server2.authentication"))
    Map(
      "hive.metastore.kerberos.principal" -> hmsKerberosPrincipal,
      "hive.server2.authentication" -> hiveServer2Authentication,
      "hive.server2.authentication.kerberos.principal" -> hsKerberosPrincipal
    )
  }

  def getCloudEncryptionConfigs(serviceConfigs: Seq[ServiceConfigurations]): Map[String, Option[String]] = {

    val hmsWarehouseDir: Option[String] =
      convertEitherToOption(
        getPropertyValue(
          serviceConfigs,
          AmbariService.HIVE_SERVICE_NAME,
          "hive-site",
          "hive.metastore.warehouse.dir"))

    val hmsWarehouseDirPerms: Option[String] =
      convertEitherToOption(
        getPropertyValue(
          serviceConfigs,
          AmbariService.HIVE_SERVICE_NAME,
          "hive-site",
          "hive.warehouse.subdir.inherit.perms"))

    val hmsReplRootDir: Option[String] =
      convertEitherToOption(
        getPropertyValue(
          serviceConfigs,
          AmbariService.HIVE_SERVICE_NAME,
          "hive-site",
          "hive.repl.replica.functions.root.dir"))

    val hiveSiteProperties = serviceConfigs.find(_.`type` == "hive-site").get.properties.as[Map[String, String]]
    val encryptionAlgorithmNameRegex = "^fs.s3a.bucket.(.+).server-side-encryption-algorithm$".r
    val hiveCloudEncryption = hiveSiteProperties.find(x => encryptionAlgorithmNameRegex.pattern.matcher(x._1).matches) match {
      case Some(result) => Some(result._2)
      case None => convertEitherToOption(
        getPropertyValue(
          serviceConfigs,
          AmbariService.HDFS_SERVICE_NAME,
          "core-site",
          "fs.s3a.server-side-encryption-algorithm"))
    }

    val encryptionAlgorithmKeyRegex = "^fs.s3a.bucket.(.+).server-side-encryption.key$".r
    val hiveCloudEncryptionKey = hiveSiteProperties.find(x => encryptionAlgorithmKeyRegex.pattern.matcher(x._1).matches) match {
      case Some(result) => Some(result._2)
      case None =>
        val kmsKey = convertEitherToOption(
         getPropertyValue(
          serviceConfigs,
          AmbariService.HDFS_SERVICE_NAME,
          "core-site",
          "fs.s3a.server-side-encryption.key"))

        kmsKey match {
          case Some(result) => Some(result)
          case None => convertEitherToOption(
            getPropertyValue(
              serviceConfigs,
              AmbariService.HDFS_SERVICE_NAME,
              "core-site",
              "fs.s3a.server-side-encryption-key"))
        }
    }

    Map(
      "hive.metastore.warehouse.dir" -> hmsWarehouseDir,
      "hive.warehouse.subdir.inherit.perms" -> hmsWarehouseDirPerms,
      "hive.repl.replica.functions.root.dir" -> hmsReplRootDir,
      "hive.cloud.encryptionAlgorithm" -> hiveCloudEncryption,
      "hive.cloud.encryptionKey" -> hiveCloudEncryptionKey
    )
  }

  def getCapacitySchedulerConfigs(clusterId: Long)(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, Ambari.ServiceConfigurations]] = {
    val p: Promise[Either[Errors, Ambari.ServiceConfigurations]] = Promise()
    val configError = Errors(Seq(Error(INTERNAL_SERVER_ERROR, "no configs")))

    getServiceConfigDetails(clusterId, List(AmbariService.YARN_SERVICE_NAME)).map {
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
    * @param serviceNames service names
    * @param token       JWT token
    * @return
    */
  def getServiceConfigDetails(clusterId: Long, serviceNames: Seq[String])(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, Option[Seq[ServiceConfigurations]]]] = {
    val p: Promise[Either[Errors, Option[Seq[ServiceConfigurations]]]] =
      Promise()
    val serviceConfigurations
      : Future[Either[Errors, Seq[ActiveServiceConfigurations]]] =
      getActiveServiceConfiguration(clusterId, serviceNames.mkString(","))
    serviceConfigurations.map {
      case Left(errors) => p.success(Left(errors))
      case Right(response) =>
        if (response.isEmpty) p.success(Right(None))
        else {
          val configurations: Seq[ServiceConfigurations] = response.filter(x => serviceNames.contains(x.service_name)).flatMap(x => x.configurations)
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
            Logger.info(errorMsg)
            Left(Errors(Seq(Error(INTERNAL_SERVER_ERROR, errorMsg))))
        }
      case None =>
        val errorMsg = s"$configType is not associated with $serviceName"
        Logger.error(errorMsg)
        Left(Errors(Seq(Error(INTERNAL_SERVER_ERROR, errorMsg))))
    }

  }
}

object AmbariService {
  lazy val RANGER_SERVICE_NAME = "RANGER"
  lazy val ATLAS_SERVICE_NAME = "ATLAS"
  lazy val HDFS_SERVICE_NAME = "HDFS"
  lazy val HIVE_SERVICE_NAME = "HIVE"
  lazy val YARN_SERVICE_NAME = "YARN"
  lazy val RANGER_ADMIN_PROPERTIES = "admin-properties"
  lazy val ATLAS_PROPERTIES = "application-properties"
  lazy val RANGER_HDFS_SECURITY_PROPERTIES = "ranger-hdfs-security"
  lazy val RANGER_HIVE_SECURITY_PROPERTIES = "ranger-hive-security"
  lazy val YARN_CAPACITY_SCHEDULER_PROPERTIES = "capacity-scheduler"
  lazy val HIVE_KERBEROS_AUTHENTICATION_VALUE = "KERBEROS"

  def getNameNodeAmbariUrl =
    "services/HDFS/components/NAMENODE?fields=host_components/metrics/dfs/FSNamesystem/HAState,host_components/HostRoles/host_name&minimal_response=true"

  def getActiveNameNodeErrMsg = "No active namenode found from Ambari REST APIs"

  def getUserPrivelegeUrl(userName: String) : String = "users/" + userName + "/authorizations/CLUSTER.VIEW_CONFIGS"

  def getActiveServiceConfigurationUrl(clusterName: String,
                                       serviceName: String): String =
    s"clusters/$clusterName/configurations/" +
      s"service_config_versions?service_name.in($serviceName)&is_current=true&group_name=Default"

  def adminPropertiesErrorMsg =
    "admin-properties configuration type is not found for Ranger service"

  def policymgrUrlErrorMsg =
    "admin-properties configuration type for Ranger service does not have policymgr_external_url property"

  def rangerPolicyNameErrorMsg =
    "Error getting current HDFS/HIVE service configuration from Ambari"
}
