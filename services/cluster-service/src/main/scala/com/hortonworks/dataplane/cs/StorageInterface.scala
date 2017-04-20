package com.hortonworks.dataplane.cs

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{
  Cluster,
  ClusterHost,
  Datalake,
  Errors,
  ClusterService => ClusterData
}
import com.hortonworks.dataplane.db.Webserice.{
  ClusterComponentService,
  ClusterHostsService,
  ClusterService,
  ConfigService,
  LakeService
}
import com.typesafe.scalalogging.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

trait StorageInterface {

  def addClusters(clusters: Seq[Cluster]): Future[Seq[Cluster]]

  def addOrUpdateHostInformation(hostInfos: Seq[ClusterHost]): Future[Errors]

  def updateServiceByName(toPersist: ClusterData): Future[Boolean]

  def getDataLakes: Future[Seq[Datalake]]

  def getLinkedClusters(datalake: Datalake): Future[Seq[Cluster]]

  def serviceRegistered(cluster: Cluster, serviceName: String): Future[Boolean]

  def addService(service: ClusterData): Future[Option[ClusterData]]

  def getConfiguration(key: String): Future[Option[String]]

  def updateDatalakeStatus(datalake: Datalake): Future[Boolean]

}

@Singleton
class StorageInterfaceImpl @Inject()(
    val clusterService: ClusterService,
    val lakeService: LakeService,
    val clusterComponentService: ClusterComponentService,
    clusterHostsService: ClusterHostsService,
    configService: ConfigService)
    extends StorageInterface {

  val logger = Logger(classOf[StorageInterfaceImpl])

  override def getDataLakes: Future[Seq[Datalake]] =
    lakeService.list
      .map { lakes =>
        if (lakes.isLeft) {
          logger.warn(
            s"No data lakes found - Reason: ${lakes.left.get.errors}")
          Seq()
        } else {
          val datalakes = lakes.right.get
          logger.info(s"found data lakes $datalakes")
          datalakes
        }

      }
      .recoverWith {
        case e: Exception =>
          logger.error(s"Exception: No data lakes found - Reason: ${e}", e)
          Future.successful(Seq())
      }

  override def getLinkedClusters(datalake: Datalake): Future[Seq[Cluster]] = {
    clusterService
      .getLinkedClusters(datalake.id.get)
      .map { cl =>
        if (cl.isLeft) {
          logger.warn(s"No clusters found - Reason: ${cl.left.get.errors}")
          Seq()
        } else {
          val clusters = cl.right.get
          logger.info(s"found clusters $clusters")
          clusters
        }

      }
      .recoverWith {
        case e: Exception =>
          logger.error(s"No Clusters found - Reason: $e")
          Future.successful(Seq())
      }
  }

  override def addService(
      service: com.hortonworks.dataplane.commons.domain.Entities.ClusterService)
    : Future[Option[
      com.hortonworks.dataplane.commons.domain.Entities.ClusterService]] = {

    clusterComponentService.create(service).map { cl =>
      if (cl.isLeft) {
        logger.warn(
          s"Cannot create cluster service - Reason: ${cl.left.get.errors}")
        None
      } else {
        val clusterService = cl.right.get
        logger.info(s"Created cluster service $clusterService")
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

  override def updateServiceByName(toPersist: ClusterData): Future[Boolean] = {
    clusterComponentService.updateServiceByName(toPersist).map(_.isRight)
  }

  override def addOrUpdateHostInformation(
      hostInfos: Seq[ClusterHost]): Future[Errors] = {

    val futures = hostInfos.map(clusterHostsService.createOrUpdate)
    val errors = Future.sequence(futures)
    errors.map(e => {
      Errors(e.flatMap(_.get.errors))
    })
  }

  override def getConfiguration(key: String): Future[Option[String]] = {
    configService.getConfig(key).map(v => v.map(o => o.configValue))
  }

  override def addClusters(clusters: Seq[Cluster]): Future[Seq[Cluster]] = {
    val c = clusters.map { c =>
      clusterService.create(c)
    }

    val sequence = Future.sequence(c)
    sequence.map { list =>
      logger.warn(s"Cluster created status $list")
      list.collect {
        case Right(cluster) => cluster
      }
    }
  }

  override def updateDatalakeStatus(datalake: Datalake): Future[Boolean] = {
    lakeService.updateStatus(datalake).map {
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
