package com.hortonworks.dataplane.cs.sync

import akka.actor.ActorRef
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.ClusterHost
import com.hortonworks.dataplane.cs.StorageInterface
import com.hortonworks.dataplane.cs.sync.TaskStatus.TaskStatus
import com.hortonworks.dataplane.cs.sync.TaskType.TaskType
import com.typesafe.config.Config
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class FetchHostInfoTask(cl: ClusterData, c: Config, w: WSClient, si: StorageInterface, cs: ActorRef) extends ClusterSyncTask(cl,c,w,si,cs) {

  override val taskType: TaskType = TaskType.HostInfo

  override def executeTask(implicit hJwtToken: Option[Entities.HJwtToken]): Future[TaskStatus] = {

   ambariInterface.getGetHostInfo.flatMap { hostInfo =>
     if (hostInfo.isRight) {
       val hostInfos = hostInfo.right.get.map(
         hi =>
           ClusterHost(
             host = hi.name,
             ipaddr = hi.ip,
             status = hi.hostStatus,
             properties = hi.properties,
             clusterId = cl.cluster.id.get
           ))

       storageInterface.addOrUpdateHostInformation(hostInfos).map { errors =>
         if (errors.errors.isEmpty) {
           TaskStatus.Complete
         } else {
           log.warning(s"Error persisting Host info $errors")
           TaskStatus.Failed
         }
       }
     } else {
       log.error(
         s"Error saving Host info, Host data was not returned",
         hostInfo.left.get)
       Future.successful(TaskStatus.Failed)
     }
   }

  }
}
