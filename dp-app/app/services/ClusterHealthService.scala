/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari.{ClusterHost, NameNodeInfo}
import com.hortonworks.dataplane.commons.domain.Constants._
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService, ClusterService, DpClusterService}
import models.ClusterHealthData

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class ClusterHealthService @Inject()(
    @Named("clusterService") val clusterService: ClusterService,
    @Named("clusterHostsService") val clusterHostsService: ClusterHostsService,
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    @Named("clusterComponentsService") val clusterComponentService: ClusterComponentService) {

  def getClusterHealthData(
                            clusterId: Long,dpClusterId: String): Future[Either[Errors,ClusterHealthData]]= {
    // get linked clusters
    val chd = for {
      namenode <- clusterComponentService.getServiceByName(clusterId, NAMENODE)
      hosts <- clusterHostsService.getHostsByCluster(clusterId)
      dataplaneCluster <- dpClusterService.retrieve(dpClusterId)
    } yield {
      val nn = namenode match {
        case Left(errors) => None
        case Right(namenode) => (namenode.properties.get \ "stats").validate[NameNodeInfo].asOpt
      }
      val hostsList =
        hosts.right.get.map(h => h.properties.get.validate[ClusterHost].get)
      val syncState = dataplaneCluster match {
        case Left(errors) => None
        case Right(dpCluster) => dpCluster.state
      }
      ClusterHealthData(nn, hostsList, syncState)
    }

    chd.map(x => Right(x)).recoverWith {
      case e: Exception =>
        Future.successful(Left(Errors(Seq(Error("500", e.getMessage)))))
    }

  }

}
