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

import com.hortonworks.dataplane.commons.domain.Entities.{CategoryCount, DatasetCategory}
import domain.{DatasetCategoryRepo, DatasetRepo}
import play.api.libs.json.Json
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class DatasetCategories @Inject()(datasetCategoryRepo: DatasetCategoryRepo,
                                  datasetRepo: DatasetRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def allWithCategoryId(categoryId: Long) = Action.async {
    datasetCategoryRepo.allWithCategoryId(categoryId).map(dc => success(dc)).recoverWith(apiError)
  }

  def allWithDatasetId(datasetId: Long) = Action.async {
    datasetCategoryRepo.allWithDatasetId(datasetId).map(dc => success(dc)).recoverWith(apiError)
  }

  def categoriesCount(searchText: Option[String], filterParam: Option[String],userId: Long) = Action.async { req =>
    (for (
      categoriesCount <- datasetRepo.getCategoriesCount(searchText, userId, filterParam);
      totalDataset <- datasetRepo.count(searchText, Some(userId), filterParam)
    ) yield {
      val list = Seq(CategoryCount("ALL", totalDataset)) ++ categoriesCount
      success(list)
    }).recoverWith(apiError)
  }

  def categoriesCountByName(categoryName: String) = Action.async {
    (if (categoryName.equals("All")) {
      datasetRepo.count(None,None, None).map(i => CategoryCount(categoryName, i))
    } else datasetCategoryRepo.getCategoryCount(categoryName)
      ).map(dc => success(Json.toJson(dc))).recoverWith(apiError)
  }

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[DatasetCategory]
      .map { dc =>
        datasetCategoryRepo
          .insert(dc)
          .map { u =>
            success(u)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(categoryId: Long, datasetId: Long) = Action.async {
    val deleteFuture = datasetCategoryRepo.deleteById(categoryId, datasetId)
    deleteFuture.map(i => success(i)).recoverWith(apiError)
  }
}