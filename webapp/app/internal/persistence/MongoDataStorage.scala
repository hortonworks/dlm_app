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

  override def loadServices: Seq[Service] = ???

  override def loadService(service: Service): Option[Service] = ???


  override def removeService(service: Service): Boolean = ???

  import com.hw.dp.service.cluster.Formatters._

  override def loadAmbari(): Future[Seq[Ambari]] = {
    val clusters: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusters"))
    clusters.flatMap(_.find(Json.obj()).cursor[Ambari]().collect[List](maxDocs = 0, Cursor.FailOnError[List[Ambari]]()).flatMap { clusterList =>
      Future.successful(clusterList)
    })
  }

  override def createOrUpdateCluster(cluster: Cluster): Future[WriteResult] = {
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusterinfo"))
    val selector = Json.obj("name" -> cluster.name, "ambariHost" -> cluster.ambariHost)
    collection.flatMap(_.find(selector).one[Cluster].flatMap { cOpt =>
      cOpt.map { c =>
        // exists // just update
        collection.flatMap(_.update(selector, cluster).flatMap { wr =>
          Future.successful(wr)
        })
      }.getOrElse {
        collection.flatMap(_.insert(cluster).flatMap { wr =>
          Future.successful(wr)
        })
      }
    })
  }

  override def createOrUpdateHost(host: Host): Future[WriteResult] = {

    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("hostinfo"))
    val selector = Json.obj("name" -> host.name, "clusterName" -> host.clusterName, "ambariHost" -> host.ambariHost)

    collection.flatMap(_.find(selector).one[Host].flatMap { hOpt =>
      hOpt.map { h =>
        //found - update
        collection.flatMap(_.update(selector, host).flatMap { wr =>
          Future.successful(wr)
        })
      }.getOrElse {
        // insert
        collection.flatMap(_.insert(host).flatMap { wr =>
          Future.successful(wr)
        })
      }

    })

  }

  override def loadClusterInfos(): Future[Seq[AmbariClusters]] = {
    Logger.info("Loading cluster information")
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("clusterinfo"))
    loadAmbari().flatMap{ambaris =>
      val seqs = ambaris.map{ambari =>
        collection.flatMap(_.find(Json.obj()).cursor[Cluster]().collect[List](maxDocs = 0, Cursor.FailOnError[List[Cluster]]()).flatMap { clusterList =>
          Future.successful(AmbariClusters(ambari,Some(clusterList)))
        })
      }
      Future.sequence(seqs)
    }
  }

  override def addComponent(component: ServiceComponent): Future[Option[WriteResult]] = {
    Logger.debug(s"Inserting component ${component}")
    val selector = Json.obj("name"->component.name,"clusterName"->component.clusterName,"ambariHost"->component.ambariHost)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("components"))
    collection.flatMap(_.find(selector).one[ServiceComponent].flatMap{ opS =>
      opS.map(op => Future.successful(None)).getOrElse{
        // insert
        collection.flatMap(_.insert(component).flatMap(wr=> Future.successful(Some(wr))))
      }
    })
  }


  override def addService(service: Service): Future[Option[WriteResult]] = {
    Logger.debug(s"Inserting service ${service}")
    val selector = Json.obj("name"->service.name,"clusterName"->service.clusterName,"ambariHost"->service.ambariHost)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("services"))
    collection.flatMap(_.find(selector).one[Service].flatMap{ opS =>
     opS.map(op => Future.successful(None)).getOrElse{
       // insert
       collection.flatMap(_.insert(service).flatMap(wr=> Future.successful(Some(wr))))
     }
    })
  }
}
