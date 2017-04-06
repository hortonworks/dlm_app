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
  LakeService
}
import com.typesafe.scalalogging.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

trait ClusterInterface {

  def addOrUpdateHostInformation(hostInfos: Seq[ClusterHost]): Future[Errors]

  def updateServiceByName(toPersist: ClusterData): Future[Boolean]

  def getDataLakes: Future[Seq[Datalake]]

  def getLinkedClusters(datalake: Datalake): Future[Seq[Cluster]]

  def serviceRegistered(cluster: Cluster, serviceName: String): Future[Boolean]

  def addService(service: ClusterData): Future[Option[ClusterData]]

}

@Singleton
class ClusterInterfaceImpl @Inject()(
    val clusterService: ClusterService,
    val lakeService: LakeService,
    val clusterComponentService: ClusterComponentService,
    clusterHostsService: ClusterHostsService)
    extends ClusterInterface {

  val logger = Logger(classOf[ClusterInterfaceImpl])

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

      val futures = hostInfos.map(clusterHostsService.createOrUpdate(_))
      val errors = Future.sequence(futures)
      errors.map(e =>
      {
        Errors(e.flatMap(_.get.errors))
      })
  }
}
