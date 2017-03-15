package controllers

import javax.inject._

import domain.EnabledSkuRepo
import com.hortonworks.dataplane.commons.domain.Entities.EnabledSku
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class EnabledSkus @Inject()(enabledSkuRepo: EnabledSkuRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    enabledSkuRepo.all.map(enabledSkus => success(enabledSkus)).recoverWith(apiError)
  }

  def load(skuId:Long) = Action.async {
    enabledSkuRepo.findById(skuId).map { skuO =>
      skuO.map { u =>
        success(u)
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[EnabledSku]
      .map { sku =>
        enabledSkuRepo
          .insert(sku.skuId, sku.enabledBy, sku.smartSenseId, sku.subscriptionId)
          .map { u =>
            success(u)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(skuId: Long) = Action.async {
    val deleteFuture = enabledSkuRepo.deleteById(skuId)
    deleteFuture.map (i => success(i)).recoverWith(apiError)
  }
}