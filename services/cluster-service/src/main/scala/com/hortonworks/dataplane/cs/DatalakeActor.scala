package com.hortonworks.dataplane.cs

import akka.actor.{Actor, ActorRef, Props}
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake}
import com.hortonworks.dataplane.commons.service.api.Poll
import play.api.libs.ws.WSClient
import scala.concurrent.ExecutionContext.Implicits.global

private[dataplane] case class GetClusters(clusters: Seq[Cluster])

class DatalakeActor(private val dataLake: Datalake,
                    private val clusterInterface: ClusterInterface,
                    private val wSClient: WSClient)
    extends Actor {

  val clusterMap = collection.mutable.Map[String, ActorRef]()

  import akka.pattern.pipe

  override def receive = {
    case Poll() =>
      clusterInterface
        .getLinkedClusters(dataLake)
        .map(GetClusters)
        .pipeTo(self)

    case GetClusters(clusters) =>
      clusters.foreach { c =>
        clusterMap.getOrElseUpdate(c.name,
                                   context.actorOf(Props(classOf[ClusterActor],
                                                         c,
                                                         wSClient,
                                                         clusterInterface),
                                                   s"Cluster_${c.id.get}"))
      }
      clusterMap.values.foreach(_ ! Poll())
  }
}
