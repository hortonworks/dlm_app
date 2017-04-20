package com.hortonworks.dataplane.cs

import akka.actor.Status.Failure
import akka.actor.{Actor, ActorLogging, ActorRef}
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake}
import com.hortonworks.dataplane.commons.service.api.Poll
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global

private sealed case class SaveAtlas(atlas: Either[Throwable, Atlas])
private sealed case class SaveNameNode(atlas: Either[Throwable, NameNode])
private sealed case class SaveKnox(atlas: Either[Throwable, KnoxInfo])
private sealed case class SaveHostInfo(
    atlas: Either[Throwable, Seq[HostInformation]])
private sealed case class HandleError(exception: Exception)

class ClusterActor(cluster: Cluster,
                   datalake: Datalake,
                   implicit val wSClient: WSClient,
                   storageInterface: StorageInterface,
                   credentials: Credentials,
                   val dbActor: ActorRef)
    extends Actor
    with ActorLogging {

  val ambariInterface = new AmbariClusterInterface(cluster, credentials)

  import akka.pattern.pipe

  override def preStart = {
    log.info(s"Starting cluster actor for ${self.path}")
  }

  override def receive = {
    case Poll() =>
      // update data lake status
      log.info(s"Received a poll for cluster actor ${self.path}")
      log.info(s"Updating status for datalake ${datalake.id.get}")

      storageInterface.updateDatalakeStatus(
        datalake.copy(state = Some("SYNC_IN_PROGRESS"))).map { res =>
        log.info(s"updated datalake status to SYNC_IN_PROGRESS for datalake ${datalake.id.get} - ${res}")
      }

      // Make sure we can connect to Ambari
      ambariInterface.ambariConnectionCheck.pipeTo(self)

    case AmbariConnection(status, url, kerberos, connectionError) =>
      log.info(s"Ambari connection to ${url} check was $status")
      if (!status && connectionError.isDefined)
        log.error(s"Ambari connection failed, reason ${connectionError.get}")
      if (status) {
        log.info("Getting ambari host information")
        ambariInterface.getGetHostInfo.map(SaveHostInfo).pipeTo(self)
      }
    case SaveAtlas(atlas) =>
      log.info("Saving ambari atlas information")
      dbActor ! PersistAtlas(cluster, atlas)
      ambariInterface.getKnoxInfo.map(SaveKnox).pipeTo(self)

    case SaveKnox(knox) =>
      log.info("Saving ambari knox information")
      dbActor ! PersistKnox(cluster, knox)
      ambariInterface.getNameNodeStats.map(SaveNameNode).pipeTo(self)

    case SaveHostInfo(hostInfo) =>
      log.info("Saving ambari host information")
      dbActor ! PersistHostInfo(cluster, hostInfo)
      ambariInterface.getAtlas.map(SaveAtlas).pipeTo(self)

    case SaveNameNode(nameNode) =>
      dbActor ! PersistNameNode(cluster, nameNode)
      log.info("Saving ambari name node information")
      storageInterface.updateDatalakeStatus(
        datalake.copy(state = Some("SYNCED"))).map { res =>
        log.info(s"updated datalake status to synced for datalake ${datalake.id.get} - ${res}")
      }

    case Failure(f) =>
      log.error(s"One of the operations resulted in a failure - ${f}")
      storageInterface.updateDatalakeStatus(
        datalake.copy(state = Some("SYNC_ERROR"))).map { res =>
        log.info(s"updated datalake status to error for datalake ${datalake.id.get} - ${res}")
      }

  }
}
