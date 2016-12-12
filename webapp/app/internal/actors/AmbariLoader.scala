package internal.actors

import akka.actor.{Actor, ActorLogging, ActorRef, PoisonPill, Props}
import com.hw.dp.service.api.Poll
import com.hw.dp.service.cluster.Ambari
import internal.DataPlaneError
import internal.persistence.DataStorage
import play.api.Logger
import play.api.libs.ws.WSClient

import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AmbariLoader(storage: DataStorage, ws: WSClient) extends Actor with ActorLogging {

  //Map for holding cluster references
  val map = mutable.Map[String, ActorRef]()

  override def receive: Receive = {

    case Poll() =>
      //load Ambari and for each instance start fetching
      val ambari: Future[Seq[Ambari]] = storage.loadAmbari()
      val buffer = ListBuffer[String]()
      ambari.map { list =>
        list.foreach { ambari =>
          if (!map.contains(ambari.host)) {
            val actorRef: ActorRef = context.actorOf(Props(classOf[AmbariSync], ambari, storage, ws))
            map.put(ambari.host, actorRef)
          }
          map.get(ambari.host).map { ref =>
            ref ! Poll()
          }.getOrElse {
            log.info(s"No worker found for key ${ambari.host}")
          }
          // fill up all clusters for this run
          buffer += ambari.host
        }
        // Clean up before next Poll
        map.keySet.map { key =>
          if (!buffer.contains(key)) {
            //terminate
            map.get(key).map(v => v ! PoisonPill)
            map.remove(key)
          }
        }
        buffer.clear()
      }.recoverWith{
        case e:Exception =>
          Logger.error("Exception while synchronizing Ambari",e)
          throw new DataPlaneError(e.getMessage)
      }
  }
}
