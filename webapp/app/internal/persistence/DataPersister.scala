package internal.persistence

import akka.actor.{Actor, ActorLogging}
import com.google.inject.Inject
import com.hw.dp.service.api.{SaveSnapshot, Snapshot}
import com.hw.dp.service.cluster.{Service, ServiceComponent}
import play.api.Logger
import scala.concurrent.ExecutionContext.Implicits.global



case class SaveService(service:Service)
case class SaveServiceComponent(component: ServiceComponent)

class DataPersister @Inject()(storage:DataStorage) extends Actor{

  override def receive: Receive = {

    case SaveServiceComponent(component) => {
      storage.addComponent(component).map { wr =>
        Logger.debug(s"Added component ${component} with result ${component}")
      }
    }

  }

}


