package com.hortonworks.dataplane.cs

import akka.actor.Actor
import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.commons.service.api.Poll
import com.typesafe.scalalogging.Logger
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global

private sealed case class GetAtlas(atlas: Either[Throwable, Atlas])
private sealed case class GetNameNode(atlas: Either[Throwable, NameNode])
private sealed case class GetKnox(atlas: Either[Throwable, KnoxInfo])
private sealed case class GetHostInfo(
    atlas: Either[Throwable, Seq[HostInformation]])

class ClusterActor(cluster: Cluster,
                   wSClient: WSClient,
                   clusterInterface: ClusterInterface)
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

      ambariInterface.getGetHostInfo.map(GetHostInfo).pipeTo(self)

    case GetAtlas(atlas) =>
      println(atlas)
      ambariInterface.getKnoxInfo.map(GetKnox).pipeTo(self)

    case GetKnox(knox) =>
      println(knox)
      ambariInterface.getNameNodeStats.map(GetNameNode).pipeTo(self)

    case GetHostInfo(hostInfo) =>
      println(hostInfo)
      ambariInterface.getAtlas.map(GetAtlas).pipeTo(self)

    case GetNameNode(nameNode) =>
      println(nameNode)
  }
}
