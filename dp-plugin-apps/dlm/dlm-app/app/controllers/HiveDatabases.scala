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
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.AmbariService
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class HiveDatabases @Inject()(val ambariService: AmbariService) extends Controller {

  def retrieveDb(clusterId: Long) = AuthenticatedAction.async { request =>
    Logger.info("Received hive databases operation request")
    implicit val token:Option[HJwtToken] = request.token
    ambariService.getHiveDatabases(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(hiveDatabaseResponse) => Ok(Json.toJson(hiveDatabaseResponse))
    }
  }

  def retrieveDbTables(clusterId: Long, dbName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received hive databases operation request")
    implicit val token:Option[HJwtToken] = request.token
    ambariService.getHiveDatabaseTables(clusterId, dbName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(hiveDatabaseResponse) => Ok(Json.toJson(hiveDatabaseResponse))
    }
  }


}
