package internal.persistence

import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.cluster._
import play.api.libs.json.Json
import reactivemongo.api.{Cursor, MongoDriver}
import reactivemongo.core.nodeset.Authenticate
import reactivemongo.play.json.collection.JSONCollection
import play.modules.reactivemongo.json._
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.Logger

@Singleton
class MongoDataStorage @Inject()(val mongoDriver: MongoDriver, configuration: play.api.Configuration) extends DataStorage {

  def getConfig(key: String): String = {
    configuration.underlying.getString(key)
  }

  private val hosts: List[String] = List(getConfig("mongodb.host"))

  val dbName = getConfig("mongodb.db")
  val userName = getConfig("mongodb.user")
  val password = getConfig("mongodb.password")
  val credentials = List(Authenticate(dbName, userName, password))
  val connection = mongoDriver.connection(hosts, authentications = credentials)

  import com.hw.dp.service.cluster.Formatters._

  override def loadAmbari(): Future[Seq[Ambari]] = {
    val clusters: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusters"))
    clusters.flatMap(_.find(Json.obj()).cursor[Ambari]().collect[List](maxDocs = 0, Cursor.FailOnError[List[Ambari]]()))
  }

  override def createOrUpdateCluster(cluster: Cluster): Future[WriteResult] = {
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusterinfo"))
    val selector = Json.obj("name" -> cluster.name, "ambariHost" -> cluster.ambariHost)
    collection.flatMap(_.find(selector).one[Cluster].flatMap { cOpt =>
      cOpt.map { c =>
        // exists // just update
        collection.flatMap(_.update(selector, cluster))
      }.getOrElse {
        collection.flatMap(_.insert(cluster))
      }
    })
  }

  override def updateAllHosts(host: Host): Future[WriteResult] = {

    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("hostinfo"))
    val selector = Json.obj("name" -> host.name, "clusterName" -> host.clusterName, "ambariHost" -> host.ambariHost)

    // delete existing host
    collection.flatMap(_.remove(selector).flatMap { dr =>
      Logger.info(s"Deleted host {host} - status ${dr.ok}")
      collection.flatMap(_.insert(host))
    })
  }

  override def loadClusterInfos(): Future[Seq[AmbariClusters]] = {
    Logger.info("Loading cluster information")
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusterinfo"))
    loadAmbari().flatMap { ambaris =>
      val seqs = ambaris.map { ambari =>
        collection.flatMap(_.find(Json.obj()).cursor[Cluster]().collect[List](maxDocs = 0, Cursor.FailOnError[List[Cluster]]()).map { clusterList =>
          AmbariClusters(ambari, Some(clusterList))
        })
      }
      Future.sequence(seqs)
    }
  }

  override def addComponent(component: ServiceComponent): Future[WriteResult] = {
    Logger.debug(s"Inserting component ${component}")
    val selector = Json.obj("name" -> component.name, "clusterName" -> component.clusterName, "ambariHost" -> component.ambariHost)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("components"))

    // Delete old service info and insert again
    collection.flatMap(_.remove(selector).flatMap { dr =>
      collection.flatMap(_.insert(component))
    })

  }

  override def updateNameNodeInfo(nameNodeInfo: NameNode): Future[WriteResult] = {
    Logger.debug(s"Inserting name node information ${nameNodeInfo}")

    val selector = Json.obj("clusterName" -> nameNodeInfo.clusterName, "ambariHost" -> nameNodeInfo.ambariHost)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("namenodeinfo"))

    // Delete old service info and insert again
    collection.flatMap(_.remove(selector).flatMap { dr =>
      collection.flatMap(_.insert(nameNodeInfo))
    })


  }

  override def saveMetrics(metric: ClusterMetric): Future[WriteResult] = {

    Logger.debug(s"Inserting metric information ${metric}")

    val selector = Json.obj("clusterName" -> metric.clusterName, "ambariHost" -> metric.ambariHost)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clustermetrics"))

    // Delete old service info and insert again
    collection.flatMap(_.remove(selector).flatMap { dr =>
      collection.flatMap(_.insert(metric))
    })

  }
}
