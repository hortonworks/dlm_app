package com.hw.dp.service.api

import akka.actor.{Actor, ActorLogging, ActorRef}

abstract class ServiceActor(service: Service,persister:Option[ActorRef]) extends Actor with ActorLogging{

  def fetchData(service: Service,onComplete:Option[Snapshot] => Unit)
  def stopRunning


  override final def receive: Receive = {
    case Poll() =>
      val underlying: Service = service
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
