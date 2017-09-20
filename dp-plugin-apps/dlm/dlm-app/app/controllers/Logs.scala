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
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.BeaconService

import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dlm.beacon.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Logs @Inject() (
  val beaconService: BeaconService,
  authenticated: Authenticated
) extends Controller {

  /**
    * Retrieve logs for beacon target cluster
    * @param clusterId   target cluster id
    * @return
    */
  def retrieve(clusterId: Long) = authenticated.async { request =>
    Logger.info("Received retrieve beacon log request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getBeaconLogs(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(beaconLogResponse) => Ok(Json.toJson(beaconLogResponse))
    }
  }
  
}
