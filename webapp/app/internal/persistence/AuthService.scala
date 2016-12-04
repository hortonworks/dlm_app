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


    val username: String = getConfig("auth.super.user") getOrElse admin
    val password: String = getConfig("auth.super.pass") getOrElse pass
    val view: UserView = UserView(username, password, true)

    for {
      user <- userStorage.getSuperUser(view)
      wr <- user.map { u =>
        userStorage.updateUser(u, view)
      }.getOrElse {
        userStorage.createUser(view)
      }
    } yield {
      if (wr.ok)
        Logger.info("Seeded super user")
      else
        Logger.error(s"Error seeding super user ${wr.writeErrors}")
    }
  }


  def getConfig(key: String): Try[String] = {
    Try(configuration.underlying.getString(key))
  }


}
