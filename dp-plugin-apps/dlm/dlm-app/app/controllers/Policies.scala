package controllers

import javax.inject.Inject

import models.JsonResponses
import models.Entities.PolicySubmitRequest
import models.{SCHEDULE,SUSPEND,RESUME,DELETE}
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
    Logger.info("Received list all policies request")
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
    Logger.info("Received retrieve policy request")
    beaconService.getPolicy(clusterId, policyName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))

    }
  }

  /**
    * Submit policy definition
    * @param clusterId    cluster id of the target cluster
    * @param policyName   name of the policy to be submitted
    * @return
    */
  def submit(clusterId: Long, policyName: String) = Action.async (parse.json) { request =>
    Logger.info("Received submit policy request")
    request.body.validate[PolicySubmitRequest].map { policySubmitRequest =>
      beaconService.createPolicy(clusterId, policyName, policySubmitRequest).map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  /**
    * Schedule policy
    * @param clusterId    cluster id of the target cluster
    * @param policyName   name of the policy to be scheduled
    * @return
    */
  def schedule(clusterId: Long, policyName: String) = Action.async {
    Logger.info("Received schedule policy request")
    beaconService.updatePolicy(clusterId, policyName, SCHEDULE).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
    }
  }

  /**
    *  Suspend policy
    * @param clusterId   cluster id of the target cluster
    * @param policyName  name of the policy to be suspended
    * @return
    */
  def suspend(clusterId: Long, policyName: String) = Action.async {
    Logger.info("Received suspend policy request")
    beaconService.updatePolicy(clusterId, policyName, SUSPEND).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
    }
  }

  /**
    * Resume suspended policy
    * @param clusterId   cluster id of the target cluster
    * @param policyName  name of the policy to be resumed
    * @return
    */
  def resume(clusterId: Long, policyName: String) = Action.async {
    Logger.info("Received resume policy request")
    beaconService.updatePolicy(clusterId, policyName, RESUME).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
    }
  }

  /**
    * Delete an existing policy
    * @param clusterId  cluster id of the target cluster
    * @param policyName policy name to be deleted
    * @return
    */
  def delete(clusterId: Long, policyName: String) = Action.async {
    Logger.info("Received delete policy request")
    beaconService.updatePolicy(clusterId, policyName, DELETE).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
    }
  }
}
