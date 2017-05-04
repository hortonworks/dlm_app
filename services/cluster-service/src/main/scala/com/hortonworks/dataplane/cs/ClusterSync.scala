package com.hortonworks.dataplane.cs

import javax.inject.{Inject, Singleton}

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSystem, PoisonPill, Props}
import com.google.common.base.Supplier
import com.hortonworks.dataplane.commons.domain.Entities.Datalake
import com.hortonworks.dataplane.commons.service.api.Poll
import com.typesafe.config.Config
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

private[cs] sealed case class GetDataLakes(lakes: Seq[Datalake],
                                           credentials: Credentials)

private[cs] sealed case class CredentialsLoaded(credentials: Credentials,
                                                datalakes: Seq[Long] = Seq())

private[cs] sealed case class InvalidCredentials(credentials: Credentials)

private[cs] sealed case class DataLakeAdded(id: Long)

@Singleton
class ClusterSync @Inject()(val actorSystem: ActorSystem,
                            val config: Config,
                            val clusterInterface: StorageInterface,
                            val wSClient: WSClient) {

  import scala.concurrent.duration._

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
    actorSystem.scheduler.schedule(start seconds,
                                   interval minutes,
                                   actorSupplier,
                                   Poll())
  }

  /**
    * Trigger an off schedule cluster sync
    * @param dataLakeId The data lake id
    */
  def trigger(dataLakeId: Long) = {
    actorSystem.scheduler.scheduleOnce(100 milliseconds,
                                       actorSupplier,
                                       DataLakeAdded(dataLakeId))
  }

}

import akka.pattern.pipe

import scala.concurrent.ExecutionContext.Implicits.global

private sealed class Synchronizer(val storageInterface: StorageInterface,
                                  val wSClient: WSClient,
                                  val config: Config)
    extends Actor
    with ActorLogging {

  val dataLakeWorkers = collection.mutable.Map[Long, ActorRef]()
  val dbActor: ActorRef =
    context.actorOf(Props(classOf[PersistenceActor], storageInterface))

  override def receive = {
    case Poll() =>
      log.info("Loading credentials from configuration")
      val creds: Future[Credentials] = loadCredentials
      // notify that credentials were loaded
      creds.map(CredentialsLoaded(_)).pipeTo(self)

    case CredentialsLoaded(credentials, lakes) =>
      log.info(s"Loaded credentials $credentials")
      if (credentials.pass.isEmpty || credentials.user.isEmpty)
        self ! InvalidCredentials(credentials)
      else {
        val dataLakes = storageInterface.getDataLakes
        if (lakes.isEmpty)
          dataLakes.map(GetDataLakes(_, credentials)).pipeTo(self)
        else
          dataLakes.map(lk => {
            val filter = lk.filter(l => l.id.get == lakes.head)
            GetDataLakes(filter, credentials)
          }).pipeTo(self)
      }

    case InvalidCredentials(credentials) =>
      log.error(s"Invalid shared credentials for Ambari $credentials")

    case GetDataLakes(dl, credentials) =>
      log.info("cleaning up old datalake workers")
      val currentLakes = collection.mutable.Set[Long]()
      dl.foreach { lake =>
        currentLakes += lake.id.get
        dataLakeWorkers.getOrElseUpdate(
          lake.id.get,
          context.actorOf(Props(classOf[DatalakeActor],
                                lake,
                                credentials,
                                config,
                                storageInterface,
                                wSClient,
                                dbActor),
                          s"Datalake_${lake.id.get}"))
      }

      // clean up
      val toClear = dataLakeWorkers.keySet -- currentLakes
      log.info(s"cleaning up workers for datalakes $toClear")
      toClear.foreach { tc =>
        dataLakeWorkers.get(tc).foreach(c => c ! PoisonPill)
        dataLakeWorkers.remove(tc)
      }
      currentLakes.clear
      // fire poll to children
      dataLakeWorkers.values.foreach(_ ! Poll())

    case ServiceSaved(clusterData, cluster) =>
      log.info(s"Cluster state saved for - ${clusterData.servicename}")
      dataLakeWorkers(cluster.datalakeid.get) ! ServiceSaved(clusterData,
                                                             cluster)

    case HostInfoSaved(cluster) =>
      dataLakeWorkers(cluster.datalakeid.get) ! HostInfoSaved(cluster)

    case DataLakeAdded(dataLakeId) =>
    // Perform the same steps but for a single data lake
      val creds: Future[Credentials] = loadCredentials
      // notify that credentials were loaded
      creds.map(CredentialsLoaded(_,Seq(dataLakeId))).pipeTo(self)

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
