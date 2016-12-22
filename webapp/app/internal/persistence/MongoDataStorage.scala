package internal.persistence

import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.cluster._
import models.{BackupPolicy, DataCenterDetail}
import play.api.libs.json.Json
import reactivemongo.api.{Cursor, MongoDriver}
import reactivemongo.core.nodeset.Authenticate
import reactivemongo.play.json.collection.JSONCollection
import play.modules.reactivemongo.json._
import reactivemongo.api.commands.WriteResult
import models.BackupPolicyFormatters._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.Logger

import scala.util.Try

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
    val selector = Json.obj("name" -> cluster.name, "ambariHost" -> cluster.ambariHost, "dataCenter" -> cluster.dataCenter)
    collection.flatMap(_.remove(selector).flatMap { dr =>
      Logger.info(s"Deleted cluster ${cluster} - status ${dr.ok}")
      collection.flatMap(_.insert(cluster))
    })
  }

  override def updateAllHosts(host: Host): Future[WriteResult] = {

    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("hostinfo"))
    val selector = Json.obj("name" -> host.name, "clusterName" -> host.clusterName, "ambariHost" -> host.ambariHost, "dataCenter" -> host.dataCenter)

    // delete existing host
    collection.flatMap(_.remove(selector).flatMap { dr =>
      Logger.info(s"Deleted host ${host} - status ${dr.ok}")
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
    val selector = Json.obj("name" -> component.name, "clusterName" -> component.clusterName, "ambariHost" -> component.ambariHost, "dataCenter" -> component.dataCenter)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("components"))

    // Delete old service info and insert again
    collection.flatMap(_.remove(selector).flatMap { dr =>
      collection.flatMap(_.insert(component))
    })

  }

  override def updateNameNodeInfo(nameNodeInfo: NameNode): Future[WriteResult] = {
    Logger.debug(s"Inserting name node information ${nameNodeInfo}")

    val selector = Json.obj("clusterName" -> nameNodeInfo.clusterName, "ambariHost" -> nameNodeInfo.ambariHost, "dataCenter" -> nameNodeInfo.dataCenter)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("namenodeinfo"))

    // Delete old service info and insert again
    collection.flatMap(_.remove(selector).flatMap { dr =>
      collection.flatMap(_.insert(nameNodeInfo))
    })


  }

  override def saveMetrics(metric: ClusterMetric): Future[WriteResult] = {

    Logger.debug(s"Inserting metric information ${metric}")

    val selector = Json.obj("clusterName" -> metric.clusterName, "ambariHost" -> metric.ambariHost, "dataCenter" -> metric.dataCenter)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clustermetrics"))

    // Delete old service info and insert again
    collection.flatMap(_.remove(selector).flatMap { dr =>
      collection.flatMap(_.insert(metric))
    })

  }

  private def getAllNodesHealth(clusters: List[Ambari],datacenter:String): Future[Seq[Host]] = {
    val hosts = clusters.map(_.host)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("hostinfo"))
    val selector = Json.obj("ambariHost" -> Json.obj("$in" -> hosts),"dataCenter" -> datacenter)
    collection.flatMap(_.find(selector).cursor[Host]().collect[List](maxDocs = 0, Cursor.FailOnError[List[Host]]()))
  }

  private def getNameNodeStats(clusters: List[Ambari],datacenter:String) = {
    val hosts = clusters.map(_.host)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("namenodeinfo"))
    val selector = Json.obj("ambariHost" -> Json.obj("$in" -> hosts),"dataCenter" -> datacenter)
    collection.flatMap(_.find(selector).cursor[NameNode]().collect[List](maxDocs = 0, Cursor.FailOnError[List[NameNode]]()))
  }

  private def getLoadAverage(clusters: List[Ambari],datacenter:String) = {
    val hosts = clusters.map(_.host)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clustermetrics"))
    val selector = Json.obj("ambariHost" -> Json.obj("$in" -> hosts),"dataCenter" -> datacenter)
    collection.flatMap(_.find(selector).cursor[ClusterMetric]().collect[List](maxDocs = 0, Cursor.FailOnError[List[ClusterMetric]]()).map { metrics =>
      Try(((metrics.map(_.loadAvg).sum) / metrics.size) * 100) getOrElse(0.0)
    })

  }

  override def loadDataCenterInfo(datacenter: String): Future[DataCenterDetail] = {
    Logger.info(s"Loading datacenter information for DC - ${datacenter}")
    val selector = Json.obj("dataCenter" -> datacenter)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusters"))
    for {
      clusters <- collection.flatMap(_.find(selector).cursor[Ambari]().collect[List](maxDocs = 0, Cursor.FailOnError[List[Ambari]]()))
      nodeList <- getAllNodesHealth(clusters,datacenter)
      nameNodes <- getNameNodeStats(clusters,datacenter)
      loadAvg <- getLoadAverage(clusters,datacenter)
    } yield {
      DataCenterDetail(nodeList, nameNodes, if(loadAvg.isNaN) 0d else loadAvg, clusters.size)
    }
  }

  override def loadCluster(clusterHost: String, datacenter: String): Future[Option[Ambari]] = {
    Logger.info(s"Loading Ambari information for DC - ${datacenter} and host - ${clusterHost}")
    val selector = Json.obj("dataCenter" -> datacenter, "host" -> clusterHost)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusters"))
    collection.flatMap(_.find(selector).one[Ambari])
  }

  override def loadClusterInformation(clusterHost: String, datacenter: String): Future[Option[Cluster]] = {
    Logger.info(s"Loading Ambari information for DC - ${datacenter} and host - ${clusterHost}")
    val selector = Json.obj("dataCenter" -> datacenter, "ambariHost" -> clusterHost)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusterinfo"))
    collection.flatMap(_.find(selector).one[Cluster])
  }

  def getBackupPolicyById(id: String): Future[BackupPolicy] = {
    val policies = connection.database(dbName).map(_.collection[JSONCollection]("policies"))

    policies.flatMap(
      _
        .find(Json.obj("label" -> id))
        .requireOne[BackupPolicy]
    )
  }

  def getDataCenterById(id: String): Future[DataCenter] = {
    import com.hw.dp.service.cluster.Formatters._

    val dataCenters = connection.database(dbName).map(_.collection[JSONCollection]("datacenters"))

    dataCenters.flatMap(
      _
        .find(Json.obj("name" -> id))
        .requireOne[DataCenter]
    )
  }

  def getClusterById(id: String): Future[Cluster] = {
    import com.hw.dp.service.cluster.Formatters._

    val clusters = connection.database(dbName).map(_.collection[JSONCollection]("clusters"))

    clusters.flatMap(
      _
        .find(Json.obj("host" -> id))
        .requireOne[Cluster]
    )
  }

  def getClustersByDataCenterId(id: String): Future[Seq[Ambari]] = {
    import com.hw.dp.service.cluster.Formatters._

    val clusters = connection.database(dbName).map(_.collection[JSONCollection]("clusters"))

    clusters.flatMap(
      _
        .find(Json.obj("dataCenter" -> id))
        .cursor[Ambari]()
        .collect[List](maxDocs = 0, Cursor.FailOnError[List[Ambari]]())
    )
  }
}
