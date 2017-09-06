/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company and Hortonworks, Inc. or
 * an authorized affiliate or partner thereof, any use, reproduction, modification, redistribution, sharing, lending
 * or other exploitation of all or any part of the contents of this software is strictly prohibited.
 */

package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.auth.Authenticated
import models.JsonFormatters._
import services.BeaconService
import play.api.mvc.{Action, Controller}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Admin @Inject()(
  val beaconService: BeaconService,
  authenticated: Authenticated
) extends Controller {

  def listStatus() = authenticated.async { request =>
    Logger.info("Received get beacon admin status request")
    implicit val token = request.token
    beaconService.getAllBeaconAdminStatus().map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }
}
