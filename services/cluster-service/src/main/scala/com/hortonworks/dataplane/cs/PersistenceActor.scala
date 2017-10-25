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

import akka.actor.Status.Failure
import akka.actor.{Actor, ActorLogging}
import akka.pattern.pipe
import com.hortonworks.dataplane.commons.domain.Entities.{
  Cluster,
  ClusterHost,
  ClusterServiceHost,
  Errors,
  ClusterService => ClusterData
}
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

private[dataplane] case class PersistAtlas(cluster: Cluster,
                                           atlas: Either[Throwable, Atlas])
private[dataplane] case class PersistKnox(cluster: Cluster,
                                          knox: Either[Throwable, KnoxInfo])
private[dataplane] case class PersistBeacon(
    cluster: Cluster,
    knox: Either[Throwable, BeaconInfo])

private[dataplane] case class PersistHdfs(cluster: Cluster,
                                          knox: Either[Throwable, Hdfs])
private[dataplane] case class PersistHive(cluster: Cluster,
                                          knox: Either[Throwable, HiveServer])

private[dataplane] case class PersistNameNode(
    cluster: Cluster,
    knox: Either[Throwable, NameNode])

private[dataplane] case class PersistHostInfo(
    cluster: Cluster,
    hostInfo: Either[Throwable, Seq[HostInformation]])

private sealed case class ServiceExists(cluster: Cluster,
                                        clusterData: ClusterData,
                                        endpoints: Seq[ClusterServiceHost],
                                        boolean: Boolean)

private sealed case class PersistenceResult(option: Option[ClusterData],
                                            cluster: Cluster)
private sealed case class UpdateResult(boolean: Boolean,
                                       clusterData: ClusterData,
                                       cluster: Cluster)
private sealed case class HostsUpdated(errors: Errors, cluster: Cluster)

class PersistenceActor(clusterInterface: StorageInterface)
    extends Actor
    with ActorLogging {

  override def receive = {
    case PersistAtlas(cluster, atlas) =>
      if (atlas.isRight) {
        val at = atlas.right.get
        val props = Try(Some(Json.parse(at.properties))).getOrElse(None)
        val toPersist = ClusterData(
          servicename = "ATLAS",
          properties = props,
          clusterId = Some(cluster.id.get)
        )

        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(ServiceExists(cluster, toPersist, Seq(), _))
          .pipeTo(self)

      } else
        log.error(s"Error saving atlas info, Atlas data was not returned",
                  atlas.left.get)

    case PersistBeacon(cluster, beacon) =>
      if (beacon.isRight) {
        val beaconInfo = beacon.right.get
        val props = Try(beaconInfo.properties).getOrElse(None)
        val toPersist = ClusterData(
          servicename = "BEACON",
          properties = props,
          clusterId = Some(cluster.id.get)
        )

        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(
            ServiceExists(cluster,
                          toPersist,
                          beaconInfo.endpoints.map(e =>
                            ClusterServiceHost(host = e.host)),
                          _))
          .pipeTo(self)

      } else
        log.error(s"Error saving Beacon info, Beacon data was not returned",
                  beacon.left.get)

    case PersistHdfs(cluster, hdfs) =>
      if (hdfs.isRight) {
        val hdfsInfo = hdfs.right.get
        val props = Try(hdfsInfo.props).getOrElse(None)
        val toPersist = ClusterData(
          servicename = "HDFS",
          properties = props,
          clusterId = Some(cluster.id.get)
        )

        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(ServiceExists(cluster, toPersist, Seq(), _))
          .pipeTo(self)

      } else
        log.error(s"Error saving HDFS info, HDFS data was not returned",
                  hdfs.left.get)

    case PersistHive(cluster, hive) =>
      if (hive.isRight) {
        val hiveInfo = hive.right.get
        val props = Try(hiveInfo.props).getOrElse(None)
        val toPersist = ClusterData(
          servicename = "HIVE",
          properties = props,
          clusterId = Some(cluster.id.get)
        )

        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(
            ServiceExists(cluster,
                          toPersist,
                          hiveInfo.serviceHost.map(e =>
                            ClusterServiceHost(host = e.host)),
                          _))
          .pipeTo(self)

      } else
        log.error(s"Error saving HIVE info, HIVE data was not returned",
                  hive.left.get)

    case PersistKnox(cluster, knox) =>
      if (knox.isRight) {
        val at = knox.right.get
        val props = at.properties
        val toPersist = ClusterData(servicename = "KNOX",
                                    properties = props,
                                    clusterId = Some(cluster.id.get))
        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(ServiceExists(cluster, toPersist, Seq(), _))
          .pipeTo(self)
      } else
        log.error(s"Error saving KNOX info, KNOX data was not returned",
                  knox.left.get)

    case PersistNameNode(cluster, namenode) =>
      if (namenode.isRight) {
        val nn = namenode.right.get
        val toPersist = ClusterData(servicename = "NAMENODE",
                                    properties = nn.props,
                                    clusterId = Some(cluster.id.get))

        clusterInterface
          .serviceRegistered(cluster, toPersist.servicename)
          .map(
            ServiceExists(cluster,
                          toPersist,
                          nn.serviceHost.map(e =>
                            ClusterServiceHost(host = e.host)),
                          _))
          .pipeTo(self)

      } else
        log.error(
          s"Error saving NAMENODE info, NAMENODE data was not returned",
          namenode.left.get)

    case PersistHostInfo(cluster, hostInfo) =>
      if (hostInfo.isRight) {
        val hostInfos = hostInfo.right.get.map(
          hi =>
            ClusterHost(
              host = hi.name,
              ipaddr = hi.ip,
              status = hi.hostStatus,
              properties = hi.properties,
              clusterId = cluster.id.get
          ))

        clusterInterface
          .addOrUpdateHostInformation(hostInfos)
          .map(HostsUpdated(_, cluster))
          .pipeTo(self)

      } else
        log.error(s"Error saving Host info, Host data was not returned, error",
                  hostInfo.left.get)

    case ServiceExists(cluster, toPersist, endpoints, exists) =>
      if (exists) {
        log.info("Service exists, updating info")
        clusterInterface
          .updateServiceByName(toPersist, endpoints)
          .map(UpdateResult(_, toPersist, cluster))
          .pipeTo(self)
      } else {
        log.info("Inserting service information")
        clusterInterface
          .addService(toPersist, endpoints)
          .map(PersistenceResult(_, cluster))
          .pipeTo(self)
      }
    case PersistenceResult(data, cluster) =>
      if (data.isDefined) {
        context.parent ! ServiceSaved(data.get, cluster)
      }
      log.info(s"Added cluster service information - $data")

    case UpdateResult(data, service, cluster) =>
      if (data) {
        log.info(s"Updated cluster service info -  ${data}")
        context.parent ! ServiceSaved(service, cluster)
      }

    case Failure(e) =>
      e.printStackTrace()
      log.error(s"Persistence Error $e", e)

    case HostsUpdated(errors, cluster) =>
      if (errors.errors.isEmpty) {
        context.parent ! HostInfoSaved(cluster)
      } else
        log.error(s"Error updating cluster info $errors")

  }

}
