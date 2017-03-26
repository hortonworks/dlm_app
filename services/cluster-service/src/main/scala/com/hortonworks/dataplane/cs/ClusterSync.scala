package com.hortonworks.dataplane.cs

import javax.inject.Inject

import akka.actor.Actor.Receive
import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import com.google.inject.Singleton
import com.typesafe.config.Config
import play.api.Logger
import play.api.libs.ws.WSClient

@Singleton
class ClusterSync @Inject()(val actorSystem: ActorSystem, val config:Config, val clusterInterface: ClusterInterface,val wSClient: WSClient) {

  val logger = Logger(classOf[ClusterSync])

  val dataLakeWorkers =  collection.mutable.Map[Long,ActorRef]


  def initialize = {

    clusterInterface.getDataLakes.map { dl =>
      dl.foreach { lake =>
        actorSystem.actorOf(Props(classOf[DatalakeActor], lake, clusterInterface, wSClient))
      }
    }
  }


}


private sealed class Synchronizer extends Actor {
  override def receive: Receive =
}
