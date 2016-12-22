package internal.persistence

import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.cluster.DataModel.DataSet
import play.api.libs.json.Json
import reactivemongo.api.commands.WriteResult
import reactivemongo.api.{Cursor, MongoDriver}
import reactivemongo.core.nodeset.Authenticate
import reactivemongo.play.json.collection.JSONCollection
import play.modules.reactivemongo.json._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

import com.hw.dp.service.cluster.Formatters._

@Singleton
class MongoDataSetStorage @Inject()(val mongoDriver: MongoDriver, configuration: play.api.Configuration) extends DataSetStorage{

  def getConfig(key: String): String = {
    configuration.underlying.getString(key)
  }

  private val hosts: List[String] = List(getConfig("mongodb.host"))

  val dbName = getConfig("mongodb.db")
  val userName = getConfig("mongodb.user")
  val password = getConfig("mongodb.password")
  val credentials = List(Authenticate(dbName, userName, password))
  val connection = mongoDriver.connection(hosts, authentications = credentials)

  override def saveDataSet(dataSet: DataSet): Future[WriteResult] = {
    val dataSets: Future[JSONCollection] = connection.database(dbName).map(_.collection("dataSets"))
    dataSets.flatMap(_.insert(dataSet))
  }


  override def deleteDataSet(name: String,cluster:String,host:String,datacenter:String): Future[WriteResult] = {
    val selector = Json.obj("name" -> name,
      "clusterName"->cluster,"ambariHost" -> host,
      "dataCenter" -> datacenter)
    val dataSets: Future[JSONCollection] = connection.database(dbName).map(_.collection("dataSets"))
    dataSets.flatMap(_.remove(selector))
  }

  override def getDataSets(cluster:String,host:String,datacenter:String): Future[Seq[DataSet]] = {
    val selector = Json.obj("clusterName"->cluster,
      "ambariHost" -> host,
      "dataCenter" -> datacenter)
    val dataSets: Future[JSONCollection] = connection.database(dbName).map(_.collection("dataSets"))
    dataSets.flatMap(_.find(selector).cursor[DataSet]().collect[List](maxDocs = 0, Cursor.FailOnError[List[DataSet]]()))
  }

  override def getDataSet(name: String,cluster:String,host:String,datacenter:String): Future[Option[DataSet]] = {
    val selector = Json.obj("name" -> name,
      "clusterName"->cluster,"ambariHost" -> host,
      "dataCenter" -> datacenter)
    val dataSets: Future[JSONCollection] = connection.database(dbName).map(_.collection("dataSets"))
    dataSets.flatMap(_.find(selector).one[DataSet])
  }
}
