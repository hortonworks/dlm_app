package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import services.{DataplaneService, BeaconService}
import play.api.mvc.{Controller, Action}
import models.JsonResponses
import play.api.libs.json.Json


import scala.concurrent.ExecutionContext.Implicits.global

class Clusters @Inject()(
  val dataplaneService: DataplaneService,
  val beaconService: BeaconService
) extends Controller {

  /**
    * Get list of all DLM enabled clusters
    */
  def list() = Action.async {
    dataplaneService.getBeaconClusters().map {
      beaconClusters => beaconClusters match {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(beaconClusters) => Ok(Json.toJson(beaconClusters))
      }
    }
  }

  /**
    * Get list of all beacon cluster pairing
    */
  def listPairs () = Action.async {
    beaconService.getAllPairedClusters().map {
      pairedClusters => pairedClusters match {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(pairedClusters) => Ok(Json.toJson(pairedClusters))
      }
    }
  }

}
