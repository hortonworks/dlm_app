package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{Errors, User, UserRoles}

import scala.concurrent.Future

object Webserice {

  trait UserService {

    def loadUser(username:String):Future[Either[Errors,User]]
    def getUserRoles(userName:String):Future[Either[Errors,UserRoles]]

  }


}
