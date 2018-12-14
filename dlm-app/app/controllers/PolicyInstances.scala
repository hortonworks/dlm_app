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

class PolicyInstances @Inject() (
  val beaconService: BeaconService
) extends Controller {

  /**
    * Retrieve all instances of a specific policy
    * @param clusterId   target cluster id
    * @param policyName  name of the policy
    * @return
    */
  def retrieve(clusterId: Long, policyName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received retrieve policy instance request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getPolicyInstances(clusterId, policyName, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))
    }
  }

  /**
    * List all instances on target cluster
    * @param clusterId  target cluster id
    * @return
    */
  def list(clusterId: Long) = AuthenticatedAction.async { request =>
    Logger.info("Received list all jobs on target cluster request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getPolicyInstancesForCluster(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))
    }
  }

  /**
    * Abort all running instances on target cluster
    * @param clusterId  target cluster id
    * @return
    */
  def abort(clusterId: Long, policyName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received abort jobs on target cluster request")
    implicit val token = request.token
    beaconService.abortPolicyInstancesOnCluster(clusterId, policyName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(response) => Ok(Json.toJson(response))
    }
  }

  /**
    * rerun last instance of the policy on target cluster
    * @param clusterId  target cluster id
    * @return
    */
  def rerun(clusterId: Long, policyName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received rerun last job of the policy on target cluster request")
    implicit val token = request.token
    beaconService.rerunLastPolicyInstance(clusterId, policyName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(response) => Ok(Json.toJson(response))
    }
  }
}
