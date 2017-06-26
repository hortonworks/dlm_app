package com.hortonworks.dataplane.cs.sync

import java.util.UUID
import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject

import akka.actor.{Actor, ActorRef, ActorSystem, PoisonPill, Props}
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, HJwtToken}
import com.hortonworks.dataplane.cs.sync.TaskStatus.TaskStatus
import com.hortonworks.dataplane.cs.{
  AmbariDataplaneClusterInterfaceImpl,
  Credentials,
  StorageInterface,
  StorageInterfaceImpl
}
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
      creds <- loadCredentials
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
  def triggerSync(dpClusterId: Long, hJwtToken: Option[HJwtToken]): Unit = {
    // Check if the cluster is already being synced
    val dpCluster = dpClusterService.retrieve(dpClusterId.toString)
    val actorRef: AtomicReference[ActorRef] = new AtomicReference[ActorRef]()
    dpCluster.map {
      case Left(errors)            => logger.error(s"Cannot load cluster - $errors")
      case Right(dataplaneCluster) =>
        // Cluster loaded
        if (dataplaneCluster.state.get == "SYNC_IN_PROGRESS"){
         logger.warn(s"Sync in progress for cluster ${dataplaneCluster.ambariUrl}, ignoring request")
        }
        else {
          createClusterIfNotExists(dataplaneCluster, hJwtToken).map { cl =>
            val completionCallback: PartialFunction[TaskStatus, Unit] = {
              case TaskStatus.Complete =>
                logger.info("Sync task completed")
                actorRef.get() ! PoisonPill
                storageInterface.updateDpClusterStatus(dataplaneCluster.copy(state = Some("SYNCED")))
              case TaskStatus.Failed =>
                logger.info("Sync task failed")
                actorRef.get() ! PoisonPill
                storageInterface.updateDpClusterStatus(dataplaneCluster.copy(state = Some("SYNCED")))
            }
            val sync = actorSystem.actorOf(
              Props(classOf[ClusterSynchronizer],
                config,
                ClusterData(dataplaneCluster, cl),
                wSClient,
                storageInterface,
                completionCallback))
            actorRef.set(sync)
            storageInterface.updateDpClusterStatus(dataplaneCluster.copy(state = Some("SYNC_IN_PROGRESS")))
            logger.info(s"Starting cluster sync for ${dataplaneCluster.ambariUrl}")
            sync ! ExecuteTask(hJwtToken)

          }
        }
    }

  }

  private def loadCredentials = {
    val creds = for {
      user <- storageInterface.getConfiguration("dp.ambari.superuser")
      pass <- storageInterface.getConfiguration("dp.ambari.superuser.password")
    } yield {
      Credentials(user, pass)
    }
    creds
  }

}
