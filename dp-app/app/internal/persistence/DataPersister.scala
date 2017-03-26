package internal.persistence

import akka.actor.Actor
import com.google.inject.Inject
import com.hortonworks.dataplane.commons.service.cluster.{Service, ServiceComponent}
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global



case class SaveService(service:Service)
case class SaveServiceComponent(component: ServiceComponent)

class DataPersister @Inject()(storage:ClusterDataStorage) extends Actor{

  override def receive: Receive = {

    case SaveServiceComponent(component) => {
      storage.addComponent(component).map { wr =>
        Logger.debug(s"Added component ${component} with result ${component}")
      }
    }

  }

}


