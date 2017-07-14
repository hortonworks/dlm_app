package com.hortonworks.dataplane.cs

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{
  Cluster,
  ClusterHost,
  ClusterServiceHost,
  DataplaneCluster,
  Errors,
  ClusterService => ClusterData
}
import com.hortonworks.dataplane.db.Webservice.{
  ClusterComponentService,
  ClusterHostsService,
  ClusterService,
  ConfigService,
  DpClusterService
}
import com.typesafe.scalalogging.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Success

trait StorageInterface {

  def addClusters(clusters: Seq[Cluster]): Future[Seq[Cluster]]

  def addOrUpdateHostInformation(hostInfos: Seq[ClusterHost]): Future[Errors]

  def updateServiceByName(toPersist: ClusterData,
                          hosts: Seq[ClusterServiceHost]): Future[Boolean]

  def getDpClusters: Future[Seq[DataplaneCluster]]

  def getLinkedClusters(dataplaneCluster: DataplaneCluster): Future[Seq[Cluster]]

  def serviceRegistered(cluster: Cluster, serviceName: String): Future[Boolean]

  def addService(service: ClusterData,
                 hosts: Seq[ClusterServiceHost]): Future[Option[ClusterData]]

  def getConfiguration(key: String): Future[Option[String]]

  def updateDpClusterStatus(dataplaneCluster: DataplaneCluster): Future[Boolean]

}

@Singleton
class StorageInterfaceImpl @Inject()(
                                      val clusterService: ClusterService,
                                      val dpClusterService: DpClusterService,
                                      val clusterComponentService: ClusterComponentService,
                                      clusterHostsService: ClusterHostsService,
                                      configService: ConfigService)
    extends StorageInterface {

  val logger = Logger(classOf[StorageInterfaceImpl])

  override def getDpClusters: Future[Seq[DataplaneCluster]] =
    dpClusterService.list
      .map { dpClusters =>
        if (dpClusters.isLeft) {
          logger.warn(
            s"No data dpClusters found - Reason: ${dpClusters.left.get.errors}")
          Seq()
        } else {
          val dataplaneClusters = dpClusters.right.get
          logger.info(s"found data dpClusters $dataplaneClusters")
          dataplaneClusters
        }

      }
      .recoverWith {
        case e: Exception =>
          logger.error(s"Exception: No data lakes found - Reason: ${e}", e)
          Future.successful(Seq())
      }

  override def getLinkedClusters(dpCluster: DataplaneCluster): Future[Seq[Cluster]] = {
    clusterService
      .getLinkedClusters(dpCluster.id.get)
      .map { cl =>
        if (cl.isLeft) {
          logger.warn(s"No clusters found - Reason: ${cl.left.get.errors}")
          Seq()
        } else {
          val clusters = cl.right.get
          logger.debug(s"found clusters $clusters")
          clusters
        }

      }
      .recoverWith {
        case e: Exception =>
          logger.error(s"No Clusters found - Reason: $e")
          Future.successful(Seq())
      }
  }

  def mapHostsToCluster(s: Either[Errors, ClusterData],
                        endPoints: Seq[ClusterServiceHost]) =
    Future.successful {
      if (s.isLeft) {
        throw new Exception(
          s"Could not create the service entry ${s.left.get}")
      } else {
        endPoints.map(_.copy(serviceid = s.right.get.id))
      }
    }

  override def addService(
      service: com.hortonworks.dataplane.commons.domain.Entities.ClusterService,
      endPoints: Seq[ClusterServiceHost]): Future[Option[
    com.hortonworks.dataplane.commons.domain.Entities.ClusterService]] = {

    val future = for {
      newService <- clusterComponentService.create(service)
      // map the endpoints to the newly created service
      eps <- mapHostsToCluster(newService, endPoints)
      // Save service endpoints
      result <- clusterComponentService.addClusterHosts(eps)
    } yield {
      result.foreach { r =>
        if (r.isLeft) {
          logger.error(
            s"Endpoint creation failed, probable reason is ${r.left.get}")
        }
      }
      newService
    }

    future.map { cl =>
      if (cl.isLeft) {
        logger.warn(
          s"Cannot create cluster service - Reason: ${cl.left.get.errors}")
        None
      } else {
        val clusterService = cl.right.get
        logger.debug(s"Created cluster service $clusterService")
        Some(clusterService)
      }
    }

  }

  override def serviceRegistered(cluster: Cluster,
                                 serviceName: String): Future[Boolean] = {
    clusterComponentService
      .getServiceByName(cluster.id.get, serviceName)
      .map(_.isRight)
  }

  override def updateServiceByName(
                                    toPersist: ClusterData,
                                    endpoints: Seq[ClusterServiceHost]): Future[Boolean] = {
    for {
      serviceUpdate <- clusterComponentService.updateServiceByName(toPersist)
      cs <- clusterComponentService.getServiceByName(toPersist.clusterId.get,
                                                     toPersist.servicename)
      eps <- mapHostsToCluster(Right(cs.right.get), endpoints)
      endpointUpdate <- clusterComponentService.updateClusterHosts(eps)
    } yield {
      val updateResult = serviceUpdate.isRight && endpointUpdate.foldRight(
          true)((a, b) => a.isRight && b)
      serviceUpdate match {
        case Left(errors) => logger.error(s"Service update errors $errors")
        case Right(result) => logger.info(s"Service update result - $result")
      }

      endpointUpdate.foreach {
        case Left(errors) =>
          logger.error(s"Service endpoint update errors $errors")
        case Right(result) =>
          logger.info(s"Service endpoint update result - $result")
      }
      updateResult
    }
  }

  override def addOrUpdateHostInformation(
      hostInfos: Seq[ClusterHost]): Future[Errors] = {

    val futures = hostInfos.map(clusterHostsService.createOrUpdate)
    val errors = Future.sequence(futures)
    val toRet = errors.map(e => {
      Errors(e.collect {
        case er if er.isDefined => er.get.errors
      }.flatten)
    })

    toRet
  }

  override def getConfiguration(key: String): Future[Option[String]] = {
    configService
      .getConfig(key)
      .map(v => v.map(o => o.configValue))
      .recoverWith {
        case e: Exception =>
          logger.error("Error when getting configuration", e)
          throw e
      }
  }

  override def addClusters(clusters: Seq[Cluster]): Future[Seq[Cluster]] = {
    val c = clusters.map { c =>
      clusterService.create(c)
    }

    val sequence = Future.sequence(c)
    sequence.map { list =>
      logger.debug(s"Cluster created status $list")
      list.collect {
        case Right(cluster) => cluster
      }
    }
  }

  override def updateDpClusterStatus(dpCluster: DataplaneCluster): Future[Boolean] = {
    dpClusterService.updateStatus(dpCluster).map {
      case Right(status) =>
        if (!status)
          logger.error(
            s"Cannot update data lake status - request possibly returned a 400")
        status
      case Left(errors) =>
        logger.error(s"Cannot update data lake status ${errors}")
        false
    }
  }
}
