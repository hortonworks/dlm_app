package internal

import akka.actor.{ActorRef, ActorSystem, Props}
import com.google.inject.{Inject, Singleton}
import com.hortonworks.dataplane.commons.service.api.{GenRandom, Poll}
import internal.actors.{AmbariLoader, ClusterHealthSync, ServiceSync}
import internal.persistence.{ClusterDataStorage, DataPersister}
import play.api.libs.ws.WSClient

import scala.collection.mutable.ListBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.util.Try

/**
  * POE for fetching Cluster information from
  * all Ambari managed clusters in the System
  */
@Singleton
class AmbariSync @Inject()(actorSystem: ActorSystem,
                           storage: ClusterDataStorage, ws: WSClient, configuration: play.api.Configuration) {

  val interval = Try(configuration.underlying.getInt("scheduler.cluster.sync.interval")).getOrElse(1)
  private val synchronizers = ListBuffer[ActorRef]()
  initialize

  def initialize = {
    val serviceActor: ActorRef = actorSystem.actorOf(Props(classOf[AmbariLoader], storage, ws),"ambariLoader")
    val dataPersister:ActorRef = actorSystem.actorOf(Props(classOf[DataPersister], storage),"dataPersister")
    val serviceSync: ActorRef = actorSystem.actorOf(Props(classOf[ServiceSync], storage, ws,dataPersister),"serviceSync")
    val clusterHealth: ActorRef = actorSystem.actorOf(Props(classOf[ClusterHealthSync], storage, ws),"clusterMetrics")
    synchronizers += serviceActor
    synchronizers += serviceSync
  }


  def clusterAdded  = {

  }


}
