package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import models.Ambari._
import com.hortonworks.dataplane.cs.Webservice.{AmbariWebService => AmbariClientService}
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken}
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
}

object AmbariService {
  def getNameNodeAmbariUrl = "services/HDFS/components/NAMENODE?fields=host_components/metrics/dfs/FSNamesystem/HAState,host_components/HostRoles/host_name&minimal_response=true"
  def getActiveNameNodeErrMsg = "No active namenode found from Ambari REST APIs"
}

