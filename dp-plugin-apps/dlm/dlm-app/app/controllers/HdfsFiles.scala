package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, HJwtToken}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import services.{AmbariService, DataplaneService, WebhdfsService}
import play.api.mvc.{Action, Controller}
import com.hortonworks.dlm.webhdfs.domain.JsonFormatters._
import models.Ambari.HostRoles

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

class HdfsFiles @Inject()(
  val webhdfsService: WebhdfsService,
  val dataplaneService: DataplaneService,
  val ambariService: AmbariService,
  authenticated: Authenticated
  ) extends Controller {

  /**
    * Get result of webhdfs file operation
    * @param clusterId
    * @return
    */
  def retrieve(clusterId: Long) = authenticated.async { request =>
    Logger.info("Received hdfs file operation request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    webhdfsService.getFileOperationResult(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))

    }
  }

}
