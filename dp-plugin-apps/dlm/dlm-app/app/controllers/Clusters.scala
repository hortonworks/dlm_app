package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import models.JsonFormatters._
import services.DataplaneService
import play.api.mvc.{Controller, Action}
import models.JsonResponses
import play.api.libs.json.Json


import scala.concurrent.ExecutionContext.Implicits.global

class Clusters @Inject()(
  val dataplaneService: DataplaneService
) extends Controller {

  /**
    * Get list of all DLM enabled clusters
    */
  def list() = Action.async {
    dataplaneService.getBeaconClusters.map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(beaconClusters) => Ok(Json.toJson(beaconClusters))
    }
  }
}
