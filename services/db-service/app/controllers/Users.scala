package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.User
import domain.UserRepo
import org.mindrot.jbcrypt.BCrypt
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Users @Inject()(userRepo: UserRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all(usernameOption: Option[String]) = Action.async {
    usernameOption match {
      case Some(username) =>
        userRepo.findByName(username).map { uo =>
          uo.map(u => success(u)).getOrElse(notFound)
        }.recoverWith(apiError)
      case None => userRepo.all.map(users => success(users)).recoverWith(apiError)
    }

  }

  def load(userId:Long) = Action.async {
    userRepo.findById(userId).map { uo =>
      uo.map { u =>
        success(u)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[User]
      .map { user =>
        userRepo
          .insert(
            username = user.username,
            password = BCrypt.hashpw(user.password, BCrypt.gensalt()),
            displayname = user.displayname,
            avatar = user.avatar
          )
          .map { u =>
            success(u)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(userId: Long) = Action.async {
    val future = userRepo.deleteByUserId(userId)
    future.map(i => success(i)).recoverWith(apiError)
  }

}
