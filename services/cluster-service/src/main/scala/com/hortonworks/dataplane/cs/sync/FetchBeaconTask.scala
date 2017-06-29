package com.hortonworks.dataplane.cs.sync

import akka.actor.ActorRef
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterServiceHost, ClusterService => ClusterServiceData}
import com.hortonworks.dataplane.cs.StorageInterface
import com.hortonworks.dataplane.cs.sync.TaskStatus.TaskStatus
import com.hortonworks.dataplane.cs.sync.TaskType.TaskType
import com.typesafe.config.Config
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class FetchBeaconTask(cl: ClusterData, c: Config, w: WSClient, si: StorageInterface, cs: ActorRef) extends ClusterSyncTask(cl,c,w,si,cs) {

  override val taskType: TaskType = TaskType.Beacon

  override def executeTask(implicit hJwtToken: Option[Entities.HJwtToken]): Future[TaskStatus] = {

   ambariInterface.getBeacon.flatMap { beacon =>
     if (beacon.isRight) {
       val beaconInfo = beacon.right.get
       val props = Try(beaconInfo.properties).getOrElse(None)
       val toPersist = ClusterServiceData(servicename = "BEACON",
         properties = props,
         clusterId = Some(cl.cluster.id.get))

       storageInterface
         .serviceRegistered(cl.cluster, toPersist.servicename)
         .flatMap {
           case true => updateService(cl.cluster,toPersist,beaconInfo.endpoints.map(e =>
             ClusterServiceHost(host = e.host))).map(_ => TaskStatus.Complete)
           case false => persistService(cl.cluster,toPersist,beaconInfo.endpoints.map(e =>
             ClusterServiceHost(host = e.host))).map(_ => TaskStatus.Complete)
         }

     } else {
       log.error(
         s"Error saving Beacon info, Beacon data was not returned",
         beacon.left.get)
       Future.successful(TaskStatus.Failed)
     }
   }

  }
}
