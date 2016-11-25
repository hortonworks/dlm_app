package internal.persistence

import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.api.Snapshot
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import reactivemongo.api.MongoDriver
import reactivemongo.core.nodeset.Authenticate
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.Future

@Singleton
class MongoSnapshotStorage @Inject()(val mongoDriver: MongoDriver,configuration: play.api.Configuration) extends SnapshotStorage{

  private val hosts: List[String] = List(getConfig("mongodb.host"))

  val dbName = getConfig("mongodb.db")
  val userName = getConfig("mongodb.user")
  val password = getConfig("mongodb.password")
  val credentials = List(Authenticate(dbName, userName, password))
  val connection = mongoDriver.connection(hosts, authentications = credentials)


  override def storeSnapshot(snapshot: Snapshot): Unit = {
    val serviceName: String = snapshot.serviceName
    val collection:Future[JSONCollection] = connection.database(dbName).map(_.collection(s"snapshot_${serviceName}"))
    collection.map(coll =>
      println(coll)
//      coll.insert(Json.toJson(snapshot))
    )
  }

  override def clearSnapshot(snapshot: Snapshot): Unit = ???

  override def loadLatestSnapShot(): Unit = ???


  def getConfig(key:String): String = {
    configuration.underlying.getString(key)
  }

}
