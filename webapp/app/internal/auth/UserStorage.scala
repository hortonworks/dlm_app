package internal.auth

import models.{User, UserView}
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future


trait UserStorage {

  def updateUser(user: User, view: UserView): Future[WriteResult]

  def createUser(view: UserView): Future[WriteResult]

  def getSuperUser(view: UserView) : Future[Option[User]]

}
