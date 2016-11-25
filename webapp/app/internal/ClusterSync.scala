package internal

import akka.actor.{ActorRef, ActorSystem, Props}
import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.api.{Poll, ServiceActor}
import com.hw.dp.services.weather.WeatherService
import internal.persistence.{DataStorage, Persister, SnapshotStorage}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._

/**
  * This is the entry point for all service synchronization tasks
  * We look at the database to get load service definitions
  * for the duration defined in the conf key dataplane.service.sync.interval
  *
  * Update the local model for the services that need to be polled
  * For each service definition a job is triggered to pull the data
  *
  * Once data is received, it is persisted to the DB.
  *
  */
class ClusterSync @Inject()(actorSystem: ActorSystem,
                            storage:DataStorage,snapshotStorage: SnapshotStorage,lifecycle: ApplicationLifecycle) {

  val services  = Map[String,Class[_ <: ServiceActor]]("weather"-> classOf[WeatherService])

  initialize

  import play.api.libs.concurrent.Execution.Implicits.defaultContext
  private def initialize = {
    storage.loadServices.foreach{ service =>
      val clazz:Class[_ <: ServiceActor] = services(service.name)
      val persister: ActorRef = actorSystem.actorOf(Props(classOf[Persister],snapshotStorage))
      val serviceActor: ActorRef = actorSystem.actorOf(Props(clazz,service,Some(persister)))
      actorSystem.scheduler.schedule(20 millis,5 seconds,serviceActor, Poll())
    }
  }

}
