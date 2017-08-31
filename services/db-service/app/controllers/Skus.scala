/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.Sku
import domain.SkuRepo
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Skus @Inject()(skuRepo: SkuRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

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

  def findByName(name:String) = Action.async {
    skuRepo.findByName(name).map { skuO =>
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