package internal

import akka.actor.{ActorRef, ActorSystem, Props}
import com.google.inject.Inject
import com.hw.dp.service.api.Poll
import internal.actors.{AmbariLoader, ServiceSync}
import internal.persistence.{DataPersister, DataStorage}
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

/**
  * POE for fetching Cluster information from
  * all Ambari managed clusters in the System
  */
class AmbariSync @Inject()(actorSystem: ActorSystem,
                           storage: DataStorage, ws: WSClient) {

  initialize

  def initialize = {
    val serviceActor: ActorRef = actorSystem.actorOf(Props(classOf[AmbariLoader], storage, ws))
    val dataPersister:ActorRef = actorSystem.actorOf(Props(classOf[DataPersister], storage))
    val serviceSync: ActorRef = actorSystem.actorOf(Props(classOf[ServiceSync], storage, ws,dataPersister))

    actorSystem.scheduler.schedule(20 millis, 1 minutes, serviceActor, Poll())
    actorSystem.scheduler.schedule(20 millis, 1 minutes, serviceSync, Poll())
  }


}
