package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities._

import scala.concurrent.Future

object Webserice {

  trait UserService {

    def loadUser(username:String):Future[Either[Errors,User]]
    def getUserRoles(userName:String):Future[Either[Errors,UserRoles]]

    def addUser(user: User):Future[Either[Errors,User]]
    def addRole(role: Role):Future[Either[Errors,Role]]
    def addUserRole(userRole: UserRole):Future[Either[Errors,UserRole]]


  }


}
