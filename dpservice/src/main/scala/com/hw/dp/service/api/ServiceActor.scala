package com.hw.dp.service.api

import akka.actor.{Actor, ActorLogging, ActorRef}
import com.hw.dp.service.cluster.{Ambari, ServiceComponent}

abstract class ServiceActor(ambari: Ambari, service: ServiceComponent, persister:Option[ActorRef]) extends Actor with ActorLogging{

  def fetchData(service: ServiceComponent,onComplete:Option[Snapshot] => Unit)

  def stopRunning = ???


  override final def receive: Receive = {
    case Poll() =>
      val underlying: ServiceComponent = service
       fetchData(underlying, { snap =>
        snap.map {
          persister.get ! SaveSnapshot(_)
        }.getOrElse {
          log.info(s"No data received, no snapshot for service ${service}")
        }
      })
    case Stop() => stopRunning

    case Restart() => {
      //TODO:Restart logic
    }

  }
}
