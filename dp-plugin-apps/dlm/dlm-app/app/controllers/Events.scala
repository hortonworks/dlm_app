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
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import models.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Events @Inject() (
  val beaconService: BeaconService,
  authenticated: Authenticated
) extends Controller {
  /**
    * Get list of all events
    */
  def list () = authenticated.async { request =>
    Logger.info("Received list all events request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getAllEvents(queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(eventResponse) => Ok(Json.toJson(eventResponse))
    }
  }
}
