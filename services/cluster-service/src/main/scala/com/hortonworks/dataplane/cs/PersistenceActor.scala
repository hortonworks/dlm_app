package com.hortonworks.dataplane.cs

import akka.actor.Actor
import akka.actor.Status.Failure
import akka.pattern.pipe
import com.hortonworks.dataplane.commons.domain.Entities.Cluster

import scala.concurrent.ExecutionContext.Implicits.global
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => ClusterData}
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json

import scala.util.Try

private[dataplane] case class PersistAtlas(cluster: Cluster, atlas: Either[Throwable, Atlas])
private sealed case class PersistenceResult(option: Option[ClusterData])

class PersistenceActor(clusterInterface: ClusterInterface) extends Actor {

  val logger = Logger(classOf[PersistenceActor])

  override def receive = {
    case PersistAtlas(cluster, atlas) =>
      if(atlas.isRight) {
        val at = atlas.right.get
        val props = Try(Some(Json.parse(at.properties))).getOrElse(None)
        val toPersist = ClusterData(servicename = "ATLAS",
          servicehost = None,
          serviceport = None,
          fullURL = Some(at.restService.toString),
          properties = props,
          clusterid = Some(cluster.id.get))

        clusterInterface.addService(toPersist).pipeTo(self)
      } else
        logger.error(s"Error saving atlas info, Atlas data was not returned, error - ${atlas.left.get}")

    case PersistenceResult(data) => logger.info(s"Added cluster service information $data")

    case Failure(e) => logger.error(s"Persistence Error ${e}")

  }


}
