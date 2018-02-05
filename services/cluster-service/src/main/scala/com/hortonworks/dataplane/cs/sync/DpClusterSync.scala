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

package com.hortonworks.dataplane.cs.sync

import java.util.UUID
import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject

import akka.actor.{Actor, ActorRef, ActorSystem, PoisonPill, Props}
import com.hortonworks.dataplane.CSConstants
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster, HJwtToken}
import com.hortonworks.dataplane.cs.sync.TaskStatus.TaskStatus
import com.hortonworks.dataplane.cs._
import com.hortonworks.dataplane.db.Webservice.DpClusterService
import com.hortonworks.dataplane.knox.Knox.KnoxConfig
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.JsValue
import play.api.libs.ws.WSClient

import scala.concurrent.Future
import scala.util.Try
import scala.concurrent.ExecutionContext.Implicits.global

class DpClusterSync @Inject()(val actorSystem: ActorSystem,
                              val config: Config,
                              val storageInterface: StorageInterface,
                              val credentialInterface: CredentialInterface,
                              val dpClusterService: DpClusterService,
                              val wSClient: WSClient) {

  val logger = Logger(classOf[DpClusterSync])

  // Set up a knox Executor

  val prefix = Try(config.getString("dp.service.ambari.cluster.api.prefix"))
    .getOrElse("/api/v1/clusters")

  private def extractSecurity(props: Option[JsValue]) = {
    props.map { json =>
      (json \ "security_type")
        .validate[String]
        .map { s =>
          s.toLowerCase == "kerberos"
        }
        .getOrElse(false)
    }
  }

  def createClusterIfNotExists(
                                dataplaneCluster: Entities.DataplaneCluster,
                                hJwtToken: Option[HJwtToken]): Future[Cluster] = {
    implicit val token = hJwtToken
    val clusters = for {
      creds <- credentialInterface.getCredential(CSConstants.AMBARI_CREDENTIAL_KEY)
      interface <- Future.successful(
        AmbariDataplaneClusterInterfaceImpl(dataplaneCluster,
          wSClient,
          config,
          creds))
      clusterNames <- interface.discoverClusters
      clusterDetails <- interface.getClusterDetails(clusterNames.head)
    } yield (clusterNames.head, clusterDetails)

    val toInsert = clusters.map { c =>
      Cluster(
        name = c._1,
        clusterUrl = Some(s"${dataplaneCluster.ambariUrl}$prefix/${c._1}"),
        secured = extractSecurity(c._2),
        properties = c._2,
        dataplaneClusterId = dataplaneCluster.id,
        userid = dataplaneCluster.createdBy
      )
    }

    val addedClusters = for {
      cl <- toInsert
      result <- storageInterface.addClusters(Seq(cl))
    } yield result

    clusters.onFailure {
      case e: Throwable =>
        logger.warn("Caught error on contacting cluster", e)
        storageInterface.updateDpClusterStatus(dataplaneCluster.copy(state = Some("SYNC_ERROR")))
    }

    addedClusters.onFailure {
      case e: Throwable => logger.warn("Caught error on adding cluster", e)
    }

    addedClusters.onSuccess {
      case clusterList => logger.info(s"Add clusters completed ${clusterList.map(_.name)}")
    }

    addedClusters.flatMap { ig =>
      logger.info(s"Added new clusters ${ig.map(_.name)}")
      storageInterface.getLinkedClusters(dataplaneCluster).map(_.head)
    }
  }

  /**
    * The entry point for the cluster data load
    *
    * @param dpClusterId
    */
  def triggerSync(dpClusterId: Long, hJwtToken: Option[HJwtToken]): Future[Boolean] = {
    // Check if the cluster is already being synced
    val dpCluster = dpClusterService.retrieve(dpClusterId.toString)
    val actorRef: AtomicReference[ActorRef] = new AtomicReference[ActorRef]()
    dpCluster.flatMap {
      case Left(errors) => {
        logger.error(s"Cannot load cluster - $errors")
        Future.successful(false)
      }
      case Right(dataplaneCluster) =>
        // Cluster loaded
        if (dataplaneCluster.state.get == "SYNC_IN_PROGRESS") {
          logger.warn(s"Sync in progress for cluster ${dataplaneCluster.ambariUrl}, ignoring request")
          Future.successful(true)
        }
        else {
          createClusterIfNotExists(dataplaneCluster, hJwtToken).map { cl =>
            val completionCallback: PartialFunction[TaskStatus, Unit] = {
              case TaskStatus.Complete =>
                logger.info("Sync task completed")
                actorRef.get() ! PoisonPill
                storageInterface.updateDpClusterStatus(dataplaneCluster.copy(state = Some("SYNCED")))
                detectDatalake(dataplaneCluster)
              case TaskStatus.Failed =>
                logger.info("Sync task failed")
                actorRef.get() ! PoisonPill
                storageInterface.updateDpClusterStatus(dataplaneCluster.copy(state = Some("SYNCED")))
                detectDatalake(dataplaneCluster)
            }
            val sync = actorSystem.actorOf(
              Props(classOf[ClusterSynchronizer],
                config,
                ClusterData(dataplaneCluster, cl),
                wSClient,
                storageInterface,
                credentialInterface,
                completionCallback))
            actorRef.set(sync)
            storageInterface.updateDpClusterStatus(dataplaneCluster.copy(state = Some("SYNC_IN_PROGRESS")))
            logger.info(s"Starting cluster sync for ${dataplaneCluster.ambariUrl}")
            sync ! ExecuteTask(hJwtToken)
            true
          }

        }
    }

  }

  private def detectDatalake(dataplaneCluster: DataplaneCluster) = {
      val isDatalake = dataplaneCluster.isDatalake.get
      dpClusterService.retrieveServiceInfo(dataplaneCluster.id.get.toString).map {
        services => {
          if (services.isRight) {
            val clusterServices = services.right.get
            val atlas = clusterServices.filter(service => service.servicename == "ATLAS")
            if (atlas.nonEmpty && !isDatalake) {
              storageInterface.markAsDatalake(dataplaneCluster.id.get, !isDatalake)
            } else if (atlas.isEmpty && isDatalake) {
              storageInterface.markAsDatalake(dataplaneCluster.id.get, !isDatalake)
            }
          }
        }
      }
  }
}
