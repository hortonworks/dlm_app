package controllers

import javax.inject._

import domain.Entities.User
import domain.UserRepo
import org.mindrot.jbcrypt.BCrypt
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Users @Inject()(userRepo: UserRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import domain.JsonFormatters._

  def all = Action.async {
    userRepo.all.map(users => success(users)).recoverWith(apiError)
  }

  def get(name: String) = Action.async {
    userRepo.findByName(name).map { uo =>
      uo.map { u =>
          success(u)
        }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
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
          .insert(user.username,
                  BCrypt.hashpw(user.password, BCrypt.gensalt()))
          .map { u =>
            success(u)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(userId: Long) = Action.async { req =>
    val future = userRepo.deleteByUserName(userId)
    future.map(i => success(i)).recoverWith(apiError)
  }

}
