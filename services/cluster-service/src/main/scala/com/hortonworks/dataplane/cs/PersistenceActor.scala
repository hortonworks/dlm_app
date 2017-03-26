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
private sealed case class ServiceExists(clusterData: ClusterData,boolean: Boolean)
private sealed case class UpdateResult(boolean: Boolean)

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
          clusterid = Some(cluster.id.get), datalakeid = None)

        clusterInterface.serviceRegistered(cluster,toPersist.servicename).map(ServiceExists(toPersist,_)).pipeTo(self)

      } else
        logger.error(s"Error saving atlas info, Atlas data was not returned, error - ${atlas.left.get}")

    case ServiceExists(toPersist,exists) =>
      if(exists){
        logger.info("Service exists, updating info")
        clusterInterface.updateServiceByName(toPersist).map(UpdateResult).pipeTo(self)
      } else {
        logger.info("Inserting service information")
        clusterInterface.addService(toPersist).map(PersistenceResult).pipeTo(self)
      }
    case PersistenceResult(data) => logger.info(s"Added cluster service information - $data")

    case UpdateResult(data) => logger.info(s"Updated cluster service info -  ${data}")

    case Failure(e) => logger.error(s"Persistence Error $e")

  }


}
