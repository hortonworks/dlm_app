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

  def getRichDataset = authenticated.async {
    dataSetService.listRichDataset()
      .map { dataSets =>
        dataSets match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(dataSets) => Ok(Json.toJson(dataSets))
        }
      }
  }

  def getRichDatasetByTag(tagName: String) = authenticated.async {
    val future = if (tagName.equalsIgnoreCase("all")) dataSetService.listRichDataset()
    else dataSetService.listRichDatasetByTag(tagName)

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

  def getDataAssetsByDatasetId(id: Long) = authenticated.async {
    dataSetService.getDataAssetByDatasetId(id)
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

  def listCategoriesCount = authenticated.async { request =>
    categoryService.listWithCount()
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


/*
   def create = Authenticated.async(parse.json) { request =>
    Logger.info("Received create dataSet request")
    val categoryIdArr = (request.body \\ "categoryId")
    request.body.validate[Dataset].map { dataSet =>
      dataSetService.create(dataSet.copy(createdBy = request.user.id.get))
        .flatMap {
          dataSet => dataSet match {
            case Left(errors) => Future.successful(InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}")))
            case Right(dataSet) => {
              if(categoryIdArr != null) {
                val futures: Seq[Future[Either[Entities.Errors, DatasetCategory]]] = categoryIdArr.map(id => {
                  dataSetCategoryService.create(DatasetCategory(id.as[Long], dataSet.id.get))
                })

                val f : Future[Seq[Either[Entities.Errors, DatasetCategory]]] = Future.sequence(futures)
                f.map( e => Ok(""))
              }
              else
               Future.successful( Ok(Json.toJson(dataSet)))
            }
          }
        }
    }.getOrElse(Future.successful(BadRequest))
  }

*/


/*

package controllers

import com.google.inject.Inject
import com.hortonworks.dataplane.commons.service.cluster.DataModel.DataSet
import internal.MongoUtilities
import internal.auth.Authenticated
import internal.persistence.DataSetStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DataSets @Inject()(dataSetStorage: DataSetStorage,Authenticated:Authenticated)
    extends Controller
    with MongoUtilities {

  import com.hortonworks.dataplane.commons.service.cluster.Formatters._

  def error(e: Exception) =
    InternalServerError(
      JsonResponses.statusError("Server error", e.getMessage))

  val ise: PartialFunction[Throwable, Future[Result]] = {
    case e: Exception =>
      Future.successful(error(e))
  }

  def getAll(host: String, datacenter: String) =
    Authenticated.async {
      dataSetStorage
        .getDataSets(host, datacenter)
        .map(ds => Ok(Json.toJson(ds)))
        .recoverWith(ise)
    }

  def getByname(name: String,
                host: String,
                datacenter: String) =
    Authenticated.async {
      dataSetStorage
        .getDataSet(name, host, datacenter)
        .map(ds => Ok(Json.toJson(ds)))
        .recoverWith(ise)
    }

  def create = Authenticated.async(parse.json) { req =>
    req.body.validate[DataSet].map { ds =>
      val toSave = DataSet.withUser(ds,req.user.username)
      dataSetStorage.saveDataSet(toSave).map { wr =>
        if (wr.ok)
          Ok(JsonResponses.statusOk)
        else
          error(new Exception(
            s"Could not save data set - write error : ${extractWriteError(wr)} "))
      }.recoverWith(ise)
    } getOrElse Future.successful(
      BadRequest(
        JsonResponses.statusError("Could not parse data set request")))
  }

  def update = Authenticated.async(parse.json) { req =>
    req.body.validate[DataSet].map { ds =>
      dataSetStorage.updateDataSet(ds).map { wr =>
        if (wr.ok)
          Ok(JsonResponses.statusOk)
        else
          error(new Exception(
            s"Could not save data set - write error : ${extractWriteError(wr)} "))
      }.recoverWith(ise)
    } getOrElse Future.successful(
      BadRequest(
        JsonResponses.statusError("Could not parse data set request")))
  }

}
*/
