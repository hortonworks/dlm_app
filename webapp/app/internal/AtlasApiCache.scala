package internal

import java.util.concurrent.ConcurrentHashMap

import akka.actor.{Actor, ActorSystem}
import com.google.inject.Inject
import com.hw.dp.service.cluster.{Ambari, Cluster}
import com.hw.dp.services.atlas.{AtlasHiveApi, AtlasHiveApiImpl}
import com.hw.dp.services.hbase.{AtlasHBaseApi, AtlasHBaseApiImpl}
import com.hw.dp.services.hdfs.{AltasHdfsApiImpl, AtlasHdfsApi}
import com.hw.dp.services.ranger.{RangerApi, RangerApiImpl}
import play.api.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

case class GetHiveApi(ambari: Ambari, cluster: Cluster)
case class GetHbaseApi(ambari: Ambari, cluster: Cluster)
case class GetHdfsApi(ambari: Ambari, cluster: Cluster)
case class GetRangerApi(ambari: Ambari, cluster: Cluster)

class AtlasApiCache @Inject()(configuration: Configuration,
                              actorSystem: ActorSystem,
                              ws: WSClient)
    extends Actor {

  private val hiveApiCache = new ConcurrentHashMap[Ambari, AtlasHiveApi]()
  private val hBaseApiCache = new ConcurrentHashMap[Ambari, AtlasHBaseApi]()
  private val hdfsApiCache = new ConcurrentHashMap[Ambari, AtlasHdfsApi]()
  private val rangerApiCache = new ConcurrentHashMap[Ambari, RangerApi]()

  def getHiveApi(ambari: Ambari, cluster: Cluster) = {
    val apiOpt = Option(hiveApiCache.get(ambari))
    apiOpt match {
      case Some(api) => Future.successful(api)
      case None =>
        val api =
          new AtlasHiveApiImpl(actorSystem, ambari, cluster, configuration, ws)
        api.initialize.map { atlas =>
          hiveApiCache.put(ambari, api)
          api
        }
    }
  }

  def getHbaseApi(ambari: Ambari, cluster: Cluster) = {
    val apiOpt = Option(hBaseApiCache.get(ambari))
    apiOpt match {
      case Some(api) => Future.successful(api)
      case None =>
        val api = new AtlasHBaseApiImpl(actorSystem,
                                        ambari,
                                        cluster,
                                        configuration,
                                        ws)
        api.initialize.map { atlas =>
          hBaseApiCache.put(ambari, api)
          api
        }
    }
  }

  def getHdfsApi(ambari: Ambari, cluster: Cluster) = {
    val apiOpt = Option(hdfsApiCache.get(ambari))
    apiOpt match {
      case Some(api) => Future.successful(api)
      case None =>
        val api =
          new AltasHdfsApiImpl(actorSystem, ambari, cluster, configuration, ws)
        api.initialize.map { atlas =>
          hdfsApiCache.put(ambari, api)
          api
        }
    }
  }

  def getRangerApi(ambari: Ambari, cluster: Cluster) = {
    val apiOpt = Option(rangerApiCache.get(ambari))
    apiOpt match {
      case Some(api) => Future.successful(api)
      case None =>
        val api = new RangerApiImpl(actorSystem,
          ambari,
          cluster,
          configuration,
          ws)
        api.initialize.map { atlas =>
          rangerApiCache.put(ambari, api)
          api
        }
    }

  }

  override def receive: Receive = {
    case GetHiveApi(ambari, cluster) =>
      sender ! getHiveApi(ambari, cluster)
    case GetHbaseApi(ambari, cluster) =>
      sender ! getHbaseApi(ambari, cluster)
    case GetHdfsApi(ambari, cluster) =>
      sender ! getHdfsApi(ambari, cluster)
    case GetRangerApi(ambari, cluster) =>
      sender ! getRangerApi(ambari, cluster)
  }
}
