package com.hortonworks.dataplane.cs

import javax.inject.Inject

import akka.actor.Actor.Receive
import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import com.google.inject.Singleton
import com.hortonworks.dataplane.commons.domain.Entities.Datalake
import com.hortonworks.dataplane.commons.service.api.Poll
import com.typesafe.config.Config
import play.api.Logger
import play.api.libs.ws.WSClient
import scala.concurrent.ExecutionContext.Implicits.global

import scala.util.Try

private sealed case class GetDataLakes(lakes: Seq[Datalake])

class ClusterSync @Inject()(val actorSystem: ActorSystem,
                            val config: Config,
                            val clusterInterface: ClusterInterface,
                            val wSClient: WSClient) {

  val logger = Logger(classOf[ClusterSync])

  import scala.concurrent.duration._

  def initialize = {
    // Start sync Scheduler
    val start = Try(config.getInt("dp.services.cluster.sync.start")).getOrElse(10)
    val interval = Try(config.getInt("dp.services.cluster.sync.interval")).getOrElse(5)
    val serviceActor: ActorRef = actorSystem.actorOf(Props(classOf[Synchronizer],clusterInterface,wSClient),"ambari_Synchronizer")
    actorSystem.scheduler.schedule(start seconds, interval minutes, serviceActor, Poll())
  }

}

import akka.pattern.pipe
import scala.concurrent.ExecutionContext.Implicits.global
private sealed class Synchronizer(val clusterInterface: ClusterInterface,
                                  val wSClient: WSClient)
    extends Actor {

  val dataLakeWorkers = collection.mutable.Map[Long, ActorRef]()

  override def receive = {
    case Poll() =>
      clusterInterface.getDataLakes.map(GetDataLakes).pipeTo(self)

    case GetDataLakes(dl) =>
      dl.foreach { lake =>
        val dlActor = context.actorOf(
          Props(classOf[DatalakeActor], lake, clusterInterface, wSClient),s"Datalake_${lake.id.get}")
        dataLakeWorkers.getOrElseUpdate(lake.id.get, dlActor)
      }
      // fire poll to children
      dataLakeWorkers.values.foreach(_ ! Poll())

  }
}
