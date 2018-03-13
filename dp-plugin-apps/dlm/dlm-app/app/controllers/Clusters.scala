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
}
