/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package controllers

import com.google.inject.Inject

import models.JsonResponses
import models.Entities.PolicySubmitRequest
import models.{SUSPEND,RESUME,DELETE}
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.BeaconService

import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import models.JsonFormatters._


import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Policies @Inject() (
  val beaconService: BeaconService
) extends Controller {


  /**
    * Get all policies across all DLM enabled clusters
    */
  def list() = AuthenticatedAction.async { request =>
    Logger.info("Received list all policies request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getAllPolicies(queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policiesDetailsResponse) => Ok(Json.toJson(policiesDetailsResponse))

    }
  }


  /**
    * Get the policy details
    * @param clusterId    cluster id
    * @param policyName   policy name
    */
  def retrieve(clusterId: Long, policyName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received retrieve policy request")
    implicit val token = request.token
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
  def submit(clusterId: Long, policyName: String) = AuthenticatedAction.async (parse.json) { request =>
    Logger.info("Received submit policy request")
    implicit val token = request.token
    request.body.validate[PolicySubmitRequest].map { policySubmitRequest =>
      beaconService.createPolicy(clusterId, policyName, policySubmitRequest).map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  /**
    *  Suspend policy
    * @param clusterId   cluster id of the target cluster
    * @param policyName  name of the policy to be suspended
    * @return
    */
  def suspend(clusterId: Long, policyName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received suspend policy request")
    implicit val token = request.token
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
  def resume(clusterId: Long, policyName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received resume policy request")
    implicit val token = request.token
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
  def delete(clusterId: Long, policyName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received delete policy request")
    implicit val token = request.token
    beaconService.updatePolicy(clusterId, policyName, DELETE).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
    }
  }
}
