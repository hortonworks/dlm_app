package com.hortonworks.dataplane.cs

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake}
import com.hortonworks.dataplane.db.Webserice.{ClusterService, LakeService}
import com.typesafe.scalalogging.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

trait ClusterInterface {

  def getDataLakes: Future[Seq[Datalake]]

  def getLinkedClusters(datalake: Datalake): Future[Seq[Cluster]]

}

@Singleton
class ClusterInterfaceImpl @Inject()(val clusterService: ClusterService, val lakeService: LakeService) extends ClusterInterface {

  val logger = Logger(classOf[ClusterInterfaceImpl])

  override def getDataLakes: Future[Seq[Datalake]] = lakeService.list.map { lakes =>
    if (lakes.isLeft) {
      logger.warn(s"No data lakes found - Reason: ${lakes.left.get.errors}")
      Seq()
    } else {
      val datalakes = lakes.right.get
      logger.info(s"found data lakes $datalakes")
      datalakes
    }

  }.recoverWith {
    case e:Exception =>
      logger.error(s"No data lakes found - Reason: ${e}")
      Future.successful(Seq())
  }

  override def getLinkedClusters(datalake: Datalake): Future[Seq[Cluster]] = {
    clusterService.getLinkedClusters(datalake.id.get).map { cl =>
      if (cl.isLeft) {
        logger.warn(s"No clusters found - Reason: ${cl.left.get.errors}")
        Seq()
      } else {
        val clusters = cl.right.get
        logger.info(s"found clusters $clusters")
        clusters
      }

    }.recoverWith {
      case e:Exception =>
        logger.error(s"No Clusters found - Reason: ${e}")
        Future.successful(Seq())
    }
  }
}
