package controllers

import javax.inject.Inject

import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.BeaconService

import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import models.JsonFormatters._


import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Policies @Inject() (val beaconService: BeaconService) extends Controller {


  /**
    * Get all policies across all DLM enabled clusters
    */
  def list() = Action.async {
    Logger.info("Received retrieve data centre request")
    beaconService.getAllPolicies.map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policiesDetailsResponse) => Ok(Json.toJson(policiesDetailsResponse))

    }
  }


  /**
    * Get the policy details
    * @param clusterId    cluster id
    * @param policyName   policy name
    */
  def retrieve(clusterId: Long, policyName: String) = Action.async {
    Logger.info("Received retrieve data centre request")
    beaconService.getPolicy(clusterId, policyName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))

    }
  }

}
