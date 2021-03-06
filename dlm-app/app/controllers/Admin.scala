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
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.JsonFormatters._
import services.{AmbariService, BeaconService}
import play.api.mvc.{Action, Controller}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import com.hortonworks.dlm.beacon.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Admin @Inject()(
  val beaconService: BeaconService,
  val ambariService: AmbariService
) extends Controller {

  def listStatus() = AuthenticatedAction.async { request =>
    Logger.info("Received get beacon admin status request")
    implicit val token = request.token
    beaconService.getAllBeaconAdminStatus().map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

  def getUserDetials(clusterId: Long) = AuthenticatedAction.async { request =>
    Logger.info("Received get beacon admin status request")
    implicit val token = request.token
    beaconService.getUserDetails(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

  def getAmbariUserPriveleges() = AuthenticatedAction.async { request =>
    Logger.info("Received get beacon admin status request")
    implicit val token = request.token
    val userName = request.user.username
    ambariService.getUserPrivilegeForAllClusters(userName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

}
