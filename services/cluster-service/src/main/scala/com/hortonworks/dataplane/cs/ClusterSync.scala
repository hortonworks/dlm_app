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

package com.hortonworks.dataplane.cs

import java.util.concurrent.atomic.AtomicBoolean
import javax.inject.{Inject, Singleton}

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSystem, PoisonPill, Props}
import com.google.common.base.Supplier
import com.hortonworks.dataplane.commons.domain.Entities.DataplaneCluster
import com.hortonworks.dataplane.commons.service.api.Poll
import com.typesafe.config.Config
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

private[cs] sealed case class GetDataplaneCluster(dpClusters: Seq[DataplaneCluster],
                                                  credentials: Credentials)

private[cs] sealed case class CredentialsLoaded(credentials: Credentials,
                                                dpClusters: Seq[Long] = Seq())

private[cs] sealed case class InvalidCredentials(credentials: Credentials)

private[cs] sealed case class DpClusterAdded(id: Long)

@Singleton
class ClusterSync @Inject()(val actorSystem: ActorSystem,
                            val config: Config,
                            val clusterInterface: StorageInterface,
                            val wSClient: WSClient) {

  import scala.concurrent.duration._
  // Not really used for thread safety
  val initialized:AtomicBoolean = new AtomicBoolean(false)
  lazy val actorSupplier: ActorRef = {
    actorSystem.actorOf(
      Props(classOf[Synchronizer], clusterInterface, wSClient, config),
      "ambari_Synchronizer")
  }

  /**
    * Initialize the system
    * @return
    */
  def initialize = {
    // Start sync Scheduler
    val start =
      Try(config.getInt("dp.services.cluster.sync.start.secs")).getOrElse(10)
    val interval =
      Try(config.getInt("dp.services.cluster.sync.interval.mins"))
        .getOrElse(5)
    if(!initialized.get()) {
      actorSystem.scheduler.schedule(start seconds,
        interval minutes,
        actorSupplier,
        Poll())
      initialized.compareAndSet(false,true)
    }


  }

  /**
    * Trigger an off schedule cluster sync
    * @param dpClusterId The data lake id
    */
  def trigger(dpClusterId: Long) = {
    actorSystem.scheduler.scheduleOnce(100 milliseconds,
                                       actorSupplier,
                                       DpClusterAdded(dpClusterId))
  }

}

import akka.pattern.pipe

import scala.concurrent.ExecutionContext.Implicits.global

private sealed class Synchronizer(val storageInterface: StorageInterface,
                                  val wSClient: WSClient,
                                  val config: Config)
    extends Actor
    with ActorLogging {

  val dpClusterWorkers = collection.mutable.Map[Long, ActorRef]()
  val dbActor: ActorRef =
    context.actorOf(Props(classOf[PersistenceActor], storageInterface))

  override def receive = {
    case Poll() =>
      log.info("Loading credentials from configuration")
      val creds: Future[Credentials] = loadCredentials
      // notify that credentials were loaded
      creds.map(CredentialsLoaded(_)).pipeTo(self)

    case CredentialsLoaded(credentials, dpClusters) =>
      log.info(s"Loaded credentials $credentials")
      if (credentials.pass.isEmpty || credentials.user.isEmpty)
        self ! InvalidCredentials(credentials)
      else {
        val eventualClusters = storageInterface.getDpClusters
        if (dpClusters.isEmpty)
          eventualClusters.map(GetDataplaneCluster(_, credentials)).pipeTo(self)
        else
          eventualClusters.map(lk => {
            val filter = lk.filter(l => l.id.get == dpClusters.head)
            GetDataplaneCluster(filter, credentials)
          }).pipeTo(self)
      }

    case InvalidCredentials(credentials) =>
      log.error(s"Invalid shared credentials for Ambari $credentials")

    case GetDataplaneCluster(dl, credentials) =>
      log.info("cleaning up old dp-cluster workers")
      val currentDpClusters = collection.mutable.Set[Long]()
      dl.foreach { dpc =>
        currentDpClusters += dpc.id.get
        dpClusterWorkers.getOrElseUpdate(
          dpc.id.get,
          context.actorOf(Props(classOf[DpClusterActor],
                                dpc,
                                credentials,
                                config,
                                storageInterface,
                                wSClient,
                                dbActor),
                          s"Datalake_${dpc.id.get}"))
      }

      // clean up
      val toClear = dpClusterWorkers.keySet -- currentDpClusters
      log.info(s"cleaning up workers for dp-clusters $toClear")
      toClear.foreach { tc =>
        dpClusterWorkers.get(tc).foreach(c => c ! PoisonPill)
        dpClusterWorkers.remove(tc)
      }
      currentDpClusters.clear
      // fire poll to children
      dpClusterWorkers.values.foreach(_ ! Poll())

    case ServiceSaved(clusterData, cluster) =>
      log.info(s"Cluster state saved for - ${clusterData.servicename}")
      dpClusterWorkers(cluster.dataplaneClusterId.get) ! ServiceSaved(clusterData,
                                                             cluster)

    case HostInfoSaved(cluster) =>
      dpClusterWorkers(cluster.dataplaneClusterId.get) ! HostInfoSaved(cluster)

    case DpClusterAdded(dpCluster) =>
    // Perform the same steps but for a single data lake
      val creds: Future[Credentials] = loadCredentials
      // notify that credentials were loaded
      creds.map(CredentialsLoaded(_,Seq(dpCluster))).pipeTo(self)

  }

  private def loadCredentials = {
    val creds = for {
      user <- storageInterface.getConfiguration("dp.ambari.superuser")
      pass <- storageInterface.getConfiguration(
        "dp.ambari.superuser.password")
    } yield {
      Credentials(user, pass)
    }
    creds
  }
}
