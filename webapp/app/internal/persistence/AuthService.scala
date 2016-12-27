package internal.persistence

import com.google.inject.{Inject, Singleton}
import internal.auth.UserStorage
import models.UserView
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

/**
  * Check and seed the admin user
  * credentials as defined in config keys auth.super.user and auth.super.pass
  */
@Singleton
class AuthService @Inject()(private val userStorage: UserStorage, private val configuration: play.api.Configuration) {

  //start on boot
  Logger.info("Initializing auth service")

  val admin: String = "admin"
  val pass: String = "admin"

  initialize
  /**
    * Seed a superuser in the system
    * If the user in the system does not match the one
    * in the configuration, then remove the system user and
    * update with the user in configuration
    */
  def initialize = {

    import collection.JavaConversions._
    val userList = configuration.underlying.getConfigList("auth.users.seed").toList

    val seedUsers  = userList.map { c =>
      UserView(c.getString("user"),c.getString("pass"),c.getBoolean("admin"),c.getString("type"))

    }

    seedUsers.foreach { view =>
      for {
        user <- userStorage.getSuperUser(view)
        wr <- user.map { u =>
          userStorage.updateUser(u, view)
        }.getOrElse {
          userStorage.createUser(view)
        }
      } yield {
        if (wr.ok)
          Logger.info(s"Seeded user ${view.username} as ${view.userType}")
        else
          Logger.error(s"Error seeding user ${wr.writeErrors}")
      }
    }
  }


  def getConfig(key: String): Try[String] = {
    Try(configuration.underlying.getString(key))
  }


}
