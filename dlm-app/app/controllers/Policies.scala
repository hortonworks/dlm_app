/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package controllers

import com.google.inject.Inject
import models.JsonResponses
import models.Entities.PolicySubmitRequest
import models.{DELETE, RESUME, SUSPEND}
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.BeaconService
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.RequestEntities.{PolicyTestRequest, PolicyUpdateRequest}
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
    * Test policy
    * @param clusterId    cluster id of the target cluster
    * @return
    */
  def testPolicy(clusterId: Long) = AuthenticatedAction.async (parse.json) { request =>
    Logger.info("Received submit policy request")
    implicit val token = request.token
    request.body.validate[PolicyTestRequest].map { policyTestRequest =>
      beaconService.testPolicy(clusterId, policyTestRequest).map {
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

  def update(clusterId: Long, policyName: String) = AuthenticatedAction.async (parse.json) { request =>
    Logger.info("Received update policy request")
    implicit val token = request.token
    request.body.validate[PolicyUpdateRequest].map { policyUpdateRequest =>
      beaconService.updateReplicationPolicy(clusterId, policyName, policyUpdateRequest).map {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(postSuccessResponse) => Ok(Json.toJson(postSuccessResponse))
      }
    }.getOrElse(Future.successful(BadRequest))
  }
}
