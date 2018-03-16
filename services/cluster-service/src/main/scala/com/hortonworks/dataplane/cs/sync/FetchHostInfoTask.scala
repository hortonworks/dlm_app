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

package com.hortonworks.dataplane.cs.sync

import akka.actor.ActorRef
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.ClusterHost
import com.hortonworks.dataplane.cs.{CredentialInterface, StorageInterface}
import com.hortonworks.dataplane.cs.sync.TaskStatus.TaskStatus
import com.hortonworks.dataplane.cs.sync.TaskType.TaskType
import com.hortonworks.dataplane.cs.tls.SslContextManager
import com.typesafe.config.Config
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class FetchHostInfoTask(cl: ClusterData, c: Config, w: WSClient, si: StorageInterface,
                        credentialInterface: CredentialInterface, cs: ActorRef, sslContextManager: SslContextManager) extends ClusterSyncTask(cl,c,w,si, credentialInterface, cs, sslContextManager) {

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
