package internal

import java.util.concurrent.ConcurrentHashMap

import akka.actor.Actor.Receive
import akka.actor.{Actor, ActorSystem}
import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.cluster.{Ambari, Cluster}
import com.hw.dp.services.atlas.{AtlasHiveApi, AtlasHiveApiImpl}
import play.api.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


case class GetApi(ambari: Ambari, cluster: Cluster)

class AtlasApiCache @Inject()(configuration: Configuration, actorSystem: ActorSystem,ws: WSClient) extends Actor {

  private val hiveApiCache = new ConcurrentHashMap[Ambari, AtlasHiveApi]()

  def getApi(ambari: Ambari, cluster: Cluster) = {
    val apiOpt = Option(hiveApiCache.get(ambari))
    apiOpt match {
      case Some(api) => Future.successful(api)
      case None =>
        val api = new AtlasHiveApiImpl(actorSystem, ambari, cluster, configuration,ws)
        api.initialize.map { atlas =>
          hiveApiCache.put(ambari, api)
          api
        }
    }
  }

  override def receive: Receive = {
    case GetApi(ambari, cluster) =>
      sender ! getApi(ambari, cluster)
  }
}
