package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.{Errors, HJwtToken}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import services.{WebhdfsService, DataplaneService, AmbariService}
import play.api.mvc.{Action, Controller}
import com.hortonworks.dlm.webhdfs.domain.JsonFormatters._
import models.Ambari.HostRoles

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

class HdfsFiles @Inject()(
  val webhdfsService: WebhdfsService,
  val dataplaneService: DataplaneService,
  val ambariService: AmbariService
  ) extends Controller {

  /**
    * Get result of webhdfs file operation
    * @param clusterId
    * @return
    */
  def retrieve(clusterId: Long) = Action.async { request =>
    Logger.info("Received hdfs file operation request")
    //TODO - @DLM devs : Pull the token header out of the request and pass it into the implicit token like shown below
    // This is all that needs to be done for supporting Knox,
    // provided you use cs-client for accessing the Ambari API's and go through the proxy
    // An easier way is to wrap all of it into an action eg : dp-app/app/internal/auth/AuthAction.scala
    // or you may do this as follows, for now setting it as None
    //    implicit val token = req.headers.get("X-DP-Token-Info").map(s =>Some(HJwtToken(s))).getOrElse(None)
    implicit val token:Option[HJwtToken] = None
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    webhdfsService.getFileOperationResult(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))

    }
  }

}
