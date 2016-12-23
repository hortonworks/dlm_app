import java.util.Date

import models.User
import org.mindrot.jbcrypt.BCrypt
import reactivemongo.api.{MongoDriver}
import reactivemongo.api.commands.WriteResult
import reactivemongo.core.nodeset.Authenticate
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}
/**
  * Created by abkumar on 20/12/16.
  */
object HelloMongo {
  def main(args: Array[String]): Unit = {
    println("hola")


    val hosts = List("mongo.vagrant.test:27017")

    val dbName = "data_plane"
    val userName = "dp_admin"
    val password = "dp_admin_password"
    val credentials = List(Authenticate(dbName, userName, password))
    val driver = new MongoDriver
    val connection = driver.connection(hosts, authentications = credentials)
    val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("users"))

    import models.JsonFormats._
    val user = User("admin", BCrypt.hashpw("admin", BCrypt.gensalt()), "SUPERUSER", "LOCAL", true, new Date(), true)
    val writeRes: Future[WriteResult] = collection.flatMap(_.insert(user))

    writeRes.onComplete { // Dummy callbacks
      case Failure(e) => e.printStackTrace()
      case Success(writeResult) =>
        println(s"successfully inserted document with result: $writeResult")
    }
  }
}
