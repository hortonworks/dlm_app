package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari.{ClusterHost, NameNodeInfo}
import com.hortonworks.dataplane.commons.domain.Constants._
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dataplane.db.Webserice.{ClusterComponentService, ClusterHostsService, ClusterService}
import models.ClusterHealthData

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class ClusterHealthService @Inject()(
    @Named("clusterService") val clusterService: ClusterService,
    @Named("clusterHostsService") val clusterHostsService: ClusterHostsService,
    @Named("clusterComponentsService") val clusterComponentService: ClusterComponentService) {

  def getClusterHealthData(
      clusterId: Long): Future[Either[Errors, ClusterHealthData]] = {
    // get linked clusters
    val chd = for {
      namenode <- clusterComponentService.getServiceByName(clusterId, NAMENODE)
      hosts <- clusterHostsService.getHostsByCluster(clusterId)
    } yield {
      val nn =
        namenode.right.get.properties.get.validate[NameNodeInfo].asOpt
      val hostsList =
        hosts.right.get.map(h => h.properties.get.validate[ClusterHost].get)
      ClusterHealthData(nn, hostsList)
    }

    chd.map(x => Right(x)).recoverWith {
      case e: Exception =>
        Future.successful(Left(Errors(Seq(Error("500", e.getMessage)))))
    }

  }

}
