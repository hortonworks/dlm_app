package controllers

import javax.inject.Inject

import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import services.WebhdfsService

import play.api.mvc.{Action, Controller}

import com.hortonworks.dlm.webhdfs.domain.JsonFormatters._


import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class HdfsFiles @Inject()(
  val webhdfsService: WebhdfsService
  ) extends Controller {

  /**
    * Get result of webhdfs file operation
    * @param clusterId
    * @return
    */
  def retrieve(clusterId: Long) = Action.async { request =>
    Logger.info("Received hdfs file operation request")
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    webhdfsService.getFileOperationResult(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))

    }
  }


}
