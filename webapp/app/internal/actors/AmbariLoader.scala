package internal.actors

import akka.actor.{Actor, ActorLogging, ActorRef, PoisonPill, Props}
import com.hortonworks.dataplane.commons.service.api.Poll
import com.hortonworks.dataplane.commons.service.cluster.Ambari
import internal.DataPlaneError
import internal.persistence.ClusterDataStorage
import play.api.Logger
import play.api.libs.ws.WSClient

import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


sealed case class Key(host:String,dc:String)
class AmbariLoader(storage: ClusterDataStorage, ws: WSClient) extends Actor with ActorLogging {

  //Map for holding cluster references
  val map = mutable.Map[Key, ActorRef]()

  override def receive: Receive = {

    case Poll() =>
      //load Ambari and for each instance start fetching
      val ambari: Future[Seq[Ambari]] = storage.loadAmbari()
      val buffer = ListBuffer[Key]()
      ambari.map { list =>
        list.foreach { ambari =>
          if (!map.contains(Key(ambari.host,ambari.dataCenter))) {
            val actorRef: ActorRef = context.actorOf(Props(classOf[AmbariSync], ambari, storage, ws))
            map.put(Key(ambari.host,ambari.dataCenter), actorRef)
          }
          map.get(Key(ambari.host,ambari.dataCenter)).map { ref =>
            ref ! Poll()
          }.getOrElse {
            log.info(s"No worker found for key ${ambari.host}")
          }
          // fill up all clusters for this run
          buffer += Key(ambari.host,ambari.dataCenter)
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
