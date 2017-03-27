package com.hortonworks.dataplane.cs

import akka.actor.{Actor, ActorRef}
import akka.actor.Status.Failure
import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.commons.service.api.Poll
import com.typesafe.scalalogging.Logger
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

private sealed case class SaveAtlas(atlas: Either[Throwable, Atlas])
private sealed case class SaveNameNode(atlas: Either[Throwable, NameNode])
private sealed case class SaveKnox(atlas: Either[Throwable, KnoxInfo])
private sealed case class SaveHostInfo(
    atlas: Either[Throwable, Seq[HostInformation]])
private sealed case class HandleError(exception: Exception)


class ClusterActor(cluster: Cluster,
                   implicit val wSClient: WSClient,
                   clusterInterface: ClusterInterface,val dbActor:ActorRef)
    extends Actor {

  val ambariInterface = new SimpleAmbariInterfaceImpl(cluster)
  val logger = Logger(classOf[ClusterActor])

  import akka.pattern.pipe

  override def preStart = {
    logger.info(s"Starting cluster actor for ${self.path}")
  }

  override def receive = {
    case Poll() =>
      logger.info(s"Received a poll for cluster actor ${self.path}")
      // Make sure we can connect to Ambari
      ambariInterface.ambariConnectionCheck.pipeTo(self)

    case AmbariConnection(status, url, kerberos, connectionError) =>
      logger.info(s"Ambari connection to ${url} check was $status")
      if (!status && connectionError.isDefined)
        logger.error(
          s"Ambari connection failed, reason ${connectionError.get}")
      if (status) {
        logger.info("Getting ambari host information")
        ambariInterface.getGetHostInfo.map(SaveHostInfo).pipeTo(self)
      }
    case SaveAtlas(atlas) =>
      logger.info("Saving ambari atlas information")
      dbActor ! PersistAtlas(cluster,atlas)
      ambariInterface.getKnoxInfo.map(SaveKnox).pipeTo(self)

    case SaveKnox(knox) =>
      logger.info("Saving ambari knox information")
      dbActor ! PersistKnox(cluster,knox)
      ambariInterface.getNameNodeStats.map(SaveNameNode).pipeTo(self)

    case SaveHostInfo(hostInfo) =>
      logger.info("Saving ambari host information")
      ambariInterface.getAtlas.map(SaveAtlas).pipeTo(self)

    case SaveNameNode(nameNode) =>
      dbActor ! PersistNameNode(cluster,nameNode)
      logger.info("Saving ambari name node information")

    case Failure(f) =>
      logger.error(s"One of the operations resulted in a failure - ${f}")

  }
}
