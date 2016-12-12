package internal

import java.util.concurrent.{ConcurrentHashMap, ConcurrentMap}

import akka.actor.{Actor, ActorSystem}
import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.cluster.{Ambari, Cluster, ServiceComponent}
import com.hw.dp.services.atlas.{AtlasHiveApi, AtlasHiveApiImpl}
import play.api.Configuration

import scala.collection.mutable
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


@Singleton
class AtlasApiCache @Inject() (configuration: Configuration,actorSystem: ActorSystem) {

  private val hiveApiCache = new ConcurrentHashMap[Ambari,AtlasHiveApi]()

   def getApi(ambari: Ambari,cluster: Cluster) = {
        val apiOpt = Option(hiveApiCache.get(ambari))
        apiOpt match {
          case Some(api) => Future.successful(api)
          case None =>
            val api = new AtlasHiveApiImpl(actorSystem,ambari,cluster,configuration)
            api.initialize.map { atlas =>
              hiveApiCache.put(ambari, api)
              api
            }
        }
  }
}
