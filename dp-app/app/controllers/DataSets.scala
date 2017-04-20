package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Category, Dataset, DatasetAndCategoryIds}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.{CategoryService, DataSetCategoryService, DataSetService}
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future



class DataSets @Inject()(@Named("dataSetService") val dataSetService: DataSetService,
                         @Named("categoryService") val categoryService: CategoryService,
                         @Named("dataSetCategoryService") val dataSetCategoryService: DataSetCategoryService)
  extends Controller {

  def list = Authenticated.async {
    Logger.info("Received list dataSet request")
    dataSetService.list()
      .map { dataSets =>
        dataSets match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(dataSets) => Ok(Json.toJson(dataSets))
        }
      }
  }

  def create = Authenticated.async(parse.json) { request =>
    Logger.info("Received create dataSet request")
    request.body.validate[DatasetAndCategoryIds].map { dSetNCtgryIds =>
      dataSetService.create(dSetNCtgryIds.copy(dataset = dSetNCtgryIds.dataset.copy(createdBy = request.user.id.get)))
        .map {
          dataSetNCategories => dataSetNCategories match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
          }
        }
    }.getOrElse(Future.successful(BadRequest))
  }

  def retrieve(dataSetId: String) = Authenticated.async {
    Logger.info("Received retrieve dataSet request")
    dataSetService.retrieve(dataSetId)
      .map {
        dataSetNCategories => dataSetNCategories match {
          case Left(errors) if(errors.errors.size > 0 && errors.errors.head.code == "404") => NotFound
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
        }
      }
  }


  def update() = Authenticated.async(parse.json) { request =>
    Logger.info("Received update dataSet request")
    request.body.validate[DatasetAndCategoryIds].map { dSetNCtgryIds =>
      dataSetService.update(dSetNCtgryIds)
        .map {
          dataSetNCategories => dataSetNCategories match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
          }
        }
    }.getOrElse(Future.successful(BadRequest))
  }


  def delete(dataSetId: String) = Authenticated.async {
    Logger.info("Received delete dataSet request")
    dataSetService.delete(dataSetId)
      .map {
        dataSet => dataSet match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(dataSet) => Ok(Json.toJson(dataSet))
        }
      }
  }

  def listAllCategories = Authenticated.async {
    Logger.info("Received list dataSet-categories request")
    categoryService.list()
      .map { categories =>
        categories match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(categories) => Ok(Json.toJson(categories))
        }
      }
  }

  def createCategory = Authenticated.async(parse.json) { request =>
    Logger.info("Received create dataSet-category request")
    request.body.validate[Category].map { category =>
      categoryService.create(category)
        .map {
          category => category match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(category) => Ok(Json.toJson(category))
          }
        }
    }.getOrElse(Future.successful(BadRequest))
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

class DataSets @Inject()(dataSetStorage: DataSetStorage)
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
