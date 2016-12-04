package internal.auth

import java.util.Date

import com.google.inject.{Inject, Singleton}
import models.{User, UserView}
import org.mindrot.jbcrypt.BCrypt
import play.api.libs.json.Json
import play.modules.reactivemongo.json._
import reactivemongo.api.MongoDriver
import reactivemongo.api.commands.WriteResult
import reactivemongo.core.nodeset.Authenticate
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

@Singleton
class MongoUserStorage @Inject()(val mongoDriver: MongoDriver, configuration: play.api.Configuration) extends UserStorage {

  def getConfig(key: String): Try[String] = {
    Try(configuration.underlying.getString(key))
  }

  private val hosts: List[String] = List(getConfig("mongodb.host").get)

  val dbName = getConfig("mongodb.db") getOrElse "data_plane"
  val userName = getConfig("mongodb.user") getOrElse "dp_admin"
  val password = getConfig("mongodb.password") getOrElse "dp_admin_password"
  val credentials = List(Authenticate(dbName, userName, password))
  val connection = mongoDriver.connection(hosts, authentications = credentials)
  val collection: Future[JSONCollection] = connection.database(dbName).map(_.collection("users"))


  import models.JsonFormats._

  override def getSuperUser(view: UserView): Future[Option[User]] = {
    val selector = Json.obj("userType" -> "SUPERUSER","username" -> view.username)
    collection.flatMap(_.find(selector).one[User])
  }

  override def updateUser(user: User, view: UserView): Future[WriteResult] = {
    val selector = Json.obj("userType" -> "SUPERUSER","username" -> view.username)
    val modifier = Json.obj("$set" -> Json.obj("username" -> view.username,"password" -> BCrypt.hashpw(view.password, BCrypt.gensalt())))
    collection.flatMap(_.update(selector,modifier))
  }

  override def createUser(view: UserView): Future[WriteResult] = {
    val user = User(view.username, BCrypt.hashpw(view.password, BCrypt.gensalt()), "SUPERUSER", "LOCAL", true, new Date(), true)
    collection.flatMap(_.insert(user))
  }
}
