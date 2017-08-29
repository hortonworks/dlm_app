package com.hortonworks.dataplane.cs.sync

import akka.actor.ActorRef
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterServiceHost, ClusterService => ClusterServiceData}
import com.hortonworks.dataplane.cs.StorageInterface
import com.hortonworks.dataplane.cs.sync.TaskStatus.TaskStatus
import com.hortonworks.dataplane.cs.sync.TaskType.TaskType
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class FetchDpProfilerTask(cl: ClusterData, c: Config, w: WSClient, si: StorageInterface, cs: ActorRef) extends ClusterSyncTask(cl, c, w, si, cs) {

  override val taskType: TaskType = TaskType.DpProfiler

  override def executeTask(implicit hJwtToken: Option[Entities.HJwtToken]): Future[TaskStatus] = {

    ambariInterface.getDpProfiler.flatMap { result =>
      if (result.isRight) {
        val dpPrflr = result.right.get
        val toPersist = ClusterServiceData(servicename = "DPPROFILER",
          properties = dpPrflr.props,
          clusterId = Some(cl.cluster.id.get))

        storageInterface
          .serviceRegistered(cl.cluster, toPersist.servicename)
          .flatMap {
            case true => updateService(cl.cluster, toPersist, dpPrflr.serviceHost.map(e =>
              ClusterServiceHost(host = e.host))).map(_ => TaskStatus.Complete)
            case false => persistService(cl.cluster, toPersist, dpPrflr.serviceHost.map(e =>
              ClusterServiceHost(host = e.host))).map(_ => TaskStatus.Complete)
          }
      } else {
        log.error(
          s"Error saving dpProfiler info, dpProfiler data was not returned",
          result.left.get)
        Future.successful(TaskStatus.Failed)
      }

    }

  }
}
