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

  def categoriesCount() = Action.async {
    (for (
      categoriesCount <- datasetCategoryRepo.getCategoriesCount();
      totalDataset <- datasetRepo.count()
    ) yield {
      val list = Seq(CategoryCount("ALL", totalDataset)) ++ categoriesCount
      success(list)
    }).recoverWith(apiError)
  }

  def categoriesCountByName(categoryName: String) = Action.async {
    datasetCategoryRepo.getCategoryCount(categoryName).map(dc => success(Json.toJson(dc))).recoverWith(apiError)
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