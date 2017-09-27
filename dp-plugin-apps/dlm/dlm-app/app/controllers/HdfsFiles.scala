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
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, HJwtToken}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import services.BeaconService
import play.api.mvc.Controller
import com.hortonworks.dlm.beacon.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

class HdfsFiles @Inject()(
  val beaconService: BeaconService
  ) extends Controller {

  /**
    * Get result of HDFS file listStatus via beacon
    * @param clusterId
    * @return
    */
  def retrieve(clusterId: Long) = AuthenticatedAction.async { request =>
    Logger.info("Received hdfs file operation request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getListHdfsFileResponse(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))

    }
  }

}
