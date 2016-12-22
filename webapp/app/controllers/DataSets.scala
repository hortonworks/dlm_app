package controllers

import com.google.inject.Inject
import com.hw.dp.service.cluster.DataModel.DataSet
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

  import com.hw.dp.service.cluster.Formatters._

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
      dataSetStorage.saveDataSet(ds).map { wr =>
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
