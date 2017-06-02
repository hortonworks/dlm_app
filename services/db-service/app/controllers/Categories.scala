package controllers

import javax.inject._

import domain.CategoryRepo
import com.hortonworks.dataplane.commons.domain.Entities.DatasetTag
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Categories @Inject()(categoryRepo: CategoryRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    categoryRepo.all.map(categorys => success(categorys)).recoverWith(apiError)
  }

  def get(name: String) = Action.async {
    categoryRepo.findByName(name).map { uo =>
      uo.map { u =>
          success(u)
        }
        .getOrElse(notFound)
    }.recoverWith(apiError)
  }

  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[DatasetTag]
      .map { category =>
        categoryRepo
          .insert(category)
          .map { c =>
            success(c)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def load(categoryId:Long) = Action.async {
    categoryRepo.findById(categoryId).map { uo =>
      uo.map { u =>
        success(u)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(categoryId: Long) = Action.async { req =>
    val future = categoryRepo.deleteById(categoryId)
    future.map(i => success(i)).recoverWith(apiError)
  }

}
