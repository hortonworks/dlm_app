package com.hortonworks.dataplane.cs

import javax.inject.Inject

import akka.actor.{
  Actor,
  ActorLogging,
  ActorRef,
  ActorSystem,
  PoisonPill,
  Props
}
import com.hortonworks.dataplane.commons.domain.Entities.Datalake
import com.hortonworks.dataplane.commons.service.api.Poll
import com.typesafe.config.Config
import play.api.libs.ws.WSClient

import scala.collection.mutable.ListBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

private sealed case class GetDataLakes(lakes: Seq[Datalake],
                                       credentials: Credentials)

private sealed case class CredentialsLoaded(credentials: Credentials)

private sealed case class InvalidCredentials(credentials: Credentials)

class ClusterSync @Inject()(val actorSystem: ActorSystem,
                            val config: Config,
                            val clusterInterface: StorageInterface,
                            val wSClient: WSClient) {

  import scala.concurrent.duration._

  def initialize = {
    // Start sync Scheduler
    val start =
      Try(config.getInt("dp.services.cluster.sync.start")).getOrElse(10)
    val interval =
      Try(config.getInt("dp.services.cluster.sync.interval")).getOrElse(5)
    val serviceActor: ActorRef = actorSystem.actorOf(
      Props(classOf[Synchronizer], clusterInterface, wSClient, config),
      "ambari_Synchronizer")
    actorSystem.scheduler.schedule(start seconds,
                                   interval minutes,
                                   serviceActor,
                                   Poll())
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
      val creds = for {
        user <- storageInterface.getConfiguration("dp.ambari.superuser")
        pass <- storageInterface.getConfiguration(
          "dp.ambari.superuser.password")
      } yield {
        Credentials(user, pass)
      }
      // notify that credentials were loaded
      creds.map(CredentialsLoaded).pipeTo(self)

    case CredentialsLoaded(credentials) =>
      log.info(s"Loaded credentials $credentials")
      if (credentials.pass.isEmpty || credentials.user.isEmpty)
        self ! InvalidCredentials(credentials)
      else
        storageInterface.getDataLakes
          .map(GetDataLakes(_, credentials))
          .pipeTo(self)

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
        dataLakeWorkers.get(tc).map(c => c ! PoisonPill)
        dataLakeWorkers.remove(tc)
      }
      currentLakes.clear
      // fire poll to children
      dataLakeWorkers.values.foreach(_ ! Poll())

  }
}
