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
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import models.JsonResponses
import models.JsonFormatters._
import play.api.libs.json.Json
import play.api.mvc.Controller
import services.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global

class YarnQueues @Inject() (val ambariService: AmbariService) extends Controller {

  def retrieve(clusterId: Long) = AuthenticatedAction.async { request =>
    implicit val token = request.token
    ambariService.getYarnQueues(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(yarnQueuesResponse) => Ok(Json.toJson(yarnQueuesResponse))
    }
  }
}
