package com.hortonworks.dataplane.cs

import akka.actor.Actor
import akka.actor.Status.Failure
import akka.pattern.pipe
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, ClusterHost, Errors, ClusterService => ClusterData}

import scala.concurrent.ExecutionContext.Implicits.global
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json

import scala.util.Try

private[dataplane] case class PersistAtlas(cluster: Cluster,
                                           atlas: Either[Throwable, Atlas])
private[dataplane] case class PersistKnox(cluster: Cluster,
                                          knox: Either[Throwable, KnoxInfo])
private[dataplane] case class PersistNameNode(
    cluster: Cluster,
    knox: Either[Throwable, NameNode])

private[dataplane] case class PersistHostInfo(
    cluster: Cluster,
    hostInfo: Either[Throwable, Seq[HostInformation]])

private sealed case class PersistenceResult(option: Option[ClusterData])
private sealed case class ServiceExists(clusterData: ClusterData,
                                        boolean: Boolean)
private sealed case class UpdateResult(boolean: Boolean)

class PersistenceActor(clusterInterface: StorageInterface) extends Actor {

  val logger = Logger(classOf[PersistenceActor])

  override def receive = {
    case PersistAtlas(cluster, atlas) =>
      if (atlas.isRight) {
        val at = atlas.right.get
        val props = Try(Some(Json.parse(at.properties))).getOrElse(None)
        val toPersist = ClusterData(
          servicename = "ATLAS",
          servicehost = None,
          serviceport = None,
          fullURL = Some(at.restService.toString),
          properties = props,
          clusterid = Some(cluster.id.get),
          datalakeid = None
        )

        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(ServiceExists(toPersist, _))
          .pipeTo(self)

      } else
        logger.error(
          s"Error saving atlas info, Atlas data was not returned, error - ${atlas.left.get}")

    case PersistKnox(cluster, knox) =>
      if (knox.isRight) {
        val at = knox.right.get
        val props = at.properties
        val toPersist = ClusterData(servicename = "KNOX",
                                    servicehost = None,
                                    serviceport = None,
                                    fullURL = None,
                                    properties = props,
                                    clusterid = Some(cluster.id.get),
                                    datalakeid = None)
        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(ServiceExists(toPersist, _))
          .pipeTo(self)
      } else
        logger.error(
          s"Error saving atlas info, Atlas data was not returned, error - ${knox.left.get}")

    case PersistNameNode(cluster, namenode) =>
      if (namenode.isRight) {
        val at = namenode.right.get
        val toPersist = ClusterData(servicename = "NAMENODE",
                                    servicehost = None,
                                    serviceport = None,
                                    fullURL = None,
                                    properties = at.props,
                                    clusterid = Some(cluster.id.get),
                                    datalakeid = None)

        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(ServiceExists(toPersist, _))
          .pipeTo(self)

      } else
        logger.error(
          s"Error saving atlas info, Atlas data was not returned, error - ${namenode.left.get}")

    case PersistHostInfo(cluster, hostInfo) =>
      implicit val dikInfoWrites =
        if (hostInfo.isRight) {
          val hostInfos = hostInfo.right.get.map(
            hi =>
              ClusterHost(
                host = hi.ip,
                status = hi.hostStatus,
                properties = hi.properties,
                clusterId = cluster.id.get
            ))
          clusterInterface.addOrUpdateHostInformation(hostInfos).pipeTo(self)

        } else
          logger.error(
            s"Error saving atlas info, Atlas data was not returned, error - ${hostInfo.left.get}")

    case ServiceExists(toPersist, exists) =>
      if (exists) {
        logger.info("Service exists, updating info")
        clusterInterface
          .updateServiceByName(toPersist)
          .map(UpdateResult)
          .pipeTo(self)
      } else {
        logger.info("Inserting service information")
        clusterInterface
          .addService(toPersist)
          .map(PersistenceResult)
          .pipeTo(self)
      }
    case PersistenceResult(data) =>
      logger.info(s"Added cluster service information - $data")

    case UpdateResult(data) =>
      logger.info(s"Updated cluster service info -  $data")

    case Failure(e) => logger.error(s"Persistence Error $e")

    case Errors(errors) =>
      logger.error(s"Error updating cluster info $errors")

  }

}
