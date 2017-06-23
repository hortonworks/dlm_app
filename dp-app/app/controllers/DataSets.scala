package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.{CategoryService, DataSetCategoryService, DataSetService}
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class DataSets @Inject()(@Named("dataSetService") val dataSetService: DataSetService,
                         @Named("categoryService") val categoryService: CategoryService,
                         @Named("dataSetCategoryService") val dataSetCategoryService: DataSetCategoryService,
                         @Named("atlasService") val atlasService: AtlasService,
                         authenticated: Authenticated)
  extends Controller {

  def list = authenticated.async {
    Logger.info("Received list dataSet request")
    dataSetService.list()
      .map { dataSets =>
        dataSets match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(dataSets) => Ok(Json.toJson(dataSets))
        }
      }
  }

  def create = authenticated.async(parse.json) { request =>
    Logger.info("Received create dataSet request")
    request.body.validate[DatasetAndCategoryIds].map { dSetNCtgryIds =>
      dataSetService.create(dSetNCtgryIds.copy(dataset = dSetNCtgryIds.dataset.copy(createdBy = request.user.id)))
        .map {
          dataSetNCategories =>
            dataSetNCategories match {
              case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
            }
        }
    }.getOrElse(Future.successful(BadRequest))
  }

  private def getAssetFromSearch(req: DatasetCreateRequest): Future[Either[Errors, Seq[DataAsset]]] = {
    atlasService.searchQueryAssets(req.clusterId.toString, req.assetQueryModels.head).map {
      case Right(entity) =>
        val assets = entity.entities.getOrElse(Nil).map {
          e =>
            DataAsset(None, e.typeName.get,
              e.attributes.get.get("name").get,
              e.guid.get, Json.toJson(e.attributes.get), req.clusterId)
        }
        Right(assets)
      case Left(e) => Left(e)
    }
  }

  def createDatasetWithAtlasSearch = authenticated.async(parse.json) { request =>
    request.body.validate[DatasetCreateRequest].map { req =>
      getAssetFromSearch(req).flatMap {
        case Right(assets) =>
          val newReq = req.copy(dataset = req.dataset.copy(createdBy = request.user.id), dataAssets = assets)
          dataSetService.create(newReq)
            .map {
              dataSetNCategories =>
                dataSetNCategories match {
                  case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
                  case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
                }
            }
        case Left(errors) =>
          Future.successful(InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}")))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def getRichDataset = authenticated.async { req =>
    dataSetService.listRichDataset(req.rawQueryString)
      .map { dataSets =>
        dataSets match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(dataSets) => Ok(Json.toJson(dataSets))
        }
      }
  }

  def getRichDatasetByTag(tagName: String) = authenticated.async { req =>
    val future = if (tagName.equalsIgnoreCase("all")) dataSetService.listRichDataset(req.rawQueryString)
    else dataSetService.listRichDatasetByTag(tagName,req.rawQueryString)

    future.map { dataSets =>
      dataSets match {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataSets) => Ok(Json.toJson(dataSets))
      }
    }
  }


  def getRichDatasetById(id: Long) = authenticated.async {
    Logger.info("Received retrieve dataSet request")
    dataSetService.getRichDatasetById(id)
      .map {
        dataSetNCategories =>
          dataSetNCategories match {
            case Left(errors) if (errors.errors.size > 0 && errors.errors.head.code == "404") => NotFound
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
          }
      }
  }

  def getDataAssetsByDatasetId(id: Long, queryName: String, offset: Long, limit: Long) = authenticated.async {
    dataSetService.getDataAssetByDatasetId(id, queryName, offset, limit)
      .map { dataSets =>
        dataSets match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(dataSets) => Ok(Json.toJson(dataSets))
        }
      }
  }

  def retrieve(dataSetId: String) = authenticated.async {
    Logger.info("Received retrieve dataSet request")
    dataSetService.retrieve(dataSetId)
      .map {
        dataSetNCategories =>
          dataSetNCategories match {
            case Left(errors) if (errors.errors.size > 0 && errors.errors.head.code == "404") => NotFound
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
          }
      }
  }


  def update() = authenticated.async(parse.json) { request =>
    Logger.info("Received update dataSet request")
    request.body.validate[DatasetAndCategoryIds].map { dSetNCtgryIds =>
      dataSetService.update(dSetNCtgryIds)
        .map {
          dataSetNCategories =>
            dataSetNCategories match {
              case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
            }
        }
    }.getOrElse(Future.successful(BadRequest))
  }


  def delete(dataSetId: String) = authenticated.async {
    Logger.info("Received delete dataSet request")
    dataSetService.delete(dataSetId)
      .map {
        dataSet =>
          dataSet match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSet) => Ok(Json.toJson(dataSet))
          }
      }
  }

  def listAllCategories = authenticated.async {
    Logger.info("Received list dataSet-categories request")
    categoryService.list()
      .map { categories =>
        categories match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(categories) => Ok(Json.toJson(categories))
        }
      }
  }

  def searchCategories(searchText: String, size: Option[Long]) = authenticated.async {
    Logger.info("Received list dataSet-categories request")
    categoryService.search(searchText, size)
      .map { categories =>
        categories match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(categories) => Ok(Json.toJson(categories))
        }
      }
  }

  def createCategory = authenticated.async(parse.json) { request =>
    Logger.info("Received create dataSet-category request")
    request.body.validate[Category].map { category =>
      categoryService.create(category)
        .map {
          category =>
            category match {
              case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case Right(category) => Ok(Json.toJson(category))
            }
        }
    }.getOrElse(Future.successful(BadRequest))
  }

  def listCategoriesCount(search:Option[String]) = authenticated.async { request =>
    categoryService.listWithCount(search)
      .map { categories =>
        categories match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(categories) => Ok(Json.toJson(categories))
        }
      }
  }

  def getCategoryCount(categoryId: String) = authenticated.async { request =>
    categoryService.listWithCount(categoryId)
      .map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(categoryCount) => Ok(Json.toJson(categoryCount))
      }
  }

}
