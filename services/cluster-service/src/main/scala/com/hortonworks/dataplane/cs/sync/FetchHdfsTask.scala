package com.hortonworks.dataplane.cs.sync

import akka.actor.ActorRef
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => ClusterServiceData}
import com.hortonworks.dataplane.cs.StorageInterface
import com.hortonworks.dataplane.cs.sync.TaskStatus.TaskStatus
import com.hortonworks.dataplane.cs.sync.TaskType.TaskType
import com.typesafe.config.Config
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class FetchHdfsTask(cl: ClusterData, c: Config, w: WSClient, si: StorageInterface, cs: ActorRef) extends ClusterSyncTask(cl,c,w,si,cs) {

  override val taskType: TaskType = TaskType.Hdfs

  override def executeTask(implicit hJwtToken: Option[Entities.HJwtToken]): Future[TaskStatus] = {

   ambariInterface.getHdfsInfo(hJwtToken).flatMap { hdfs =>
     if (hdfs.isRight) {
       val hdfsInfo = hdfs.right.get
       val props = Try(hdfsInfo.props).getOrElse(None)
       val toPersist = ClusterServiceData(servicename = "HDFS",
         properties = props,
         clusterId = Some(cl.cluster.id.get))

       storageInterface
         .serviceRegistered(cl.cluster, toPersist.servicename)
         .flatMap {
           case true => updateService(cl.cluster,toPersist,Seq()).map(_ => TaskStatus.Complete)
           case false => persistService(cl.cluster,toPersist,Seq()).map(_ => TaskStatus.Complete)
         }

     } else {
       log.error(
         s"Error saving HDFS info, HDFS data was not returned",
         hdfs.left.get)
       Future.successful(TaskStatus.Failed)
     }
   }

  }
}
