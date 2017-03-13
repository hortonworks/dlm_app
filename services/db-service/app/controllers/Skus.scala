package controllers

import javax.inject._

import domain.Entities.Sku
import domain.SkuRepo
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Skus @Inject()(skuRepo: SkuRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import domain.JsonFormatters._

  def all = Action.async {
    skuRepo.all.map(skus => success(skus)).recoverWith(apiError)
  }

  def load(skuId:Long) = Action.async {
    skuRepo.findById(skuId).map { skuO =>
      skuO.map { u =>
        success(u)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[Sku]
      .map { sku =>
        skuRepo
          .insert(sku.name, sku.description)
          .map { u =>
            success(u)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(skuId: Long) = Action.async {
    val deleteFuture = skuRepo.deleteById(skuId)
    deleteFuture.map (i => success(i)).recoverWith(apiError)
  }
}