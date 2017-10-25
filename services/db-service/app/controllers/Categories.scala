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

import domain.CategoryRepo
import com.hortonworks.dataplane.commons.domain.Entities.Category
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

  def search(searchText: String, size: Option[Long]) = Action.async {
    categoryRepo.searchByName(searchText, size.getOrElse(Long.MaxValue))
      .map(categorys => success(categorys)).recoverWith(apiError)
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

  def load(categoryId: Long) = Action.async {
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
