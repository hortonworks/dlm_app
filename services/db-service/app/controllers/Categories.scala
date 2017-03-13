package controllers

import javax.inject._

import domain.CategoryRepo
import domain.Entities.Category
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Categories @Inject()(categoryRepo: CategoryRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import domain.JsonFormatters._

  def all = Action.async {
    categoryRepo.all.map(users => success(users)).recoverWith(apiError)
  }

  def get(name: String) = Action.async {
    categoryRepo.findByName(name).map { uo =>
      uo.map { u =>
          success(u)
        }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def load(userId:Long) = Action.async {
    categoryRepo.findById(userId).map { uo =>
      uo.map { u =>
        success(u)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[Category]
      .map { category =>
        categoryRepo
          .insert(category)
          .map { c =>
            success(c)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(categoryId: Long) = Action.async { req =>
    val future = categoryRepo.deleteById(categoryId)
    future.map(i => success(i)).recoverWith(apiError)
  }

}
