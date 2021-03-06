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

import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.JsonFormatters._
import services.{AmbariService, DataplaneService, BeaconService}
import play.api.mvc.{Action, Controller}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global

class Clusters @Inject()(
  val dataplaneService: DataplaneService,
  val ambariService: AmbariService,
  val beaconService: BeaconService
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

  def listStatus() = AuthenticatedAction.async { request =>
    Logger.info("Received get cluster status request")
    implicit val token = request.token
    ambariService.getAllClusterHealthStatus().map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

  def retrieveStatus(clusterId: Long) = AuthenticatedAction.async { request =>
    Logger.info("Received get cluster status request")
    implicit val token = request.token
    ambariService.getClusterHealthStatus(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

  def listBeaconRequiredConfigs() = AuthenticatedAction.async { request =>
    Logger.info("Received get cluster status request")
    implicit val token = request.token
    ambariService.getAllBeaconClusterConfigDetails().map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

  def getBeaconClusterDetails(clusterEndpointId : Long, clusterId: Long) = AuthenticatedAction.async { request =>
    Logger.info("Received get beacon cluster details request")
    implicit val token = request.token
    beaconService.getClusterDetails(clusterEndpointId, clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

  def createLocalClusterDefinition(clusterId: Long) = AuthenticatedAction.async { request =>
    Logger.info("Received create local beacon cluster details request")
    implicit val token = request.token
    beaconService.createLocalClusterDefinition(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(JsonResponses.statusOk)
    }
  }
}
