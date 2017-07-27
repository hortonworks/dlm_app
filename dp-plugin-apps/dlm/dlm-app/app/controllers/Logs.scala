package controllers

import javax.inject.Inject

import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.BeaconService

import com.hortonworks.dlm.beacon.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Logs @Inject() (
  val beaconService: BeaconService
) extends Controller {

  /**
    * Retrieve logs for beacon target cluster
    * @param clusterId   target cluster id
    * @return
    */
  def retrieve(clusterId: Long) = Action.async { request =>
    Logger.info("Received retrieve beacon log request")
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getBeaconLogs(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(beaconLogResponse) => Ok(Json.toJson(beaconLogResponse))
    }
  }
  
}
