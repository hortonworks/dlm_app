/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company and Hortonworks, Inc. or
 * an authorized affiliate or partner thereof, any use, reproduction, modification, redistribution, sharing, lending
 * or other exploitation of all or any part of the contents of this software is strictly prohibited.
 */


package controllers

import com.google.inject.Inject
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import play.api.mvc.Controller
import services.BeaconService
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import models.JsonFormatters._
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CloudCred @Inject() (
  val beaconService: BeaconService
) extends Controller {
  /**
    * Get the cloud credential details
    * @param clusterId    cluster id
    * @param credCloudId   cloud cred id
    */
  def retrieveById(clusterId: Long, credCloudId: String) = AuthenticatedAction.async { request =>
    Logger.info("Received retrieve cloud credential request")
    implicit val token = request.token
    beaconService.getCloudCredById(clusterId, credCloudId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(credCloudResponse) => Ok(Json.toJson(credCloudResponse))

    }
  }

  /**
    * Get the cloud credential details
    * @param clusterId    cluster id
    * @param credCloudName   cloud cred DLM id
    */
  def retrieveByName(clusterId: Long, credCloudName: String) = AuthenticatedAction.async { request =>
    Logger.info("Received retrieve cloud credential request")
    implicit val token = request.token
    beaconService.getCloudCredByName(clusterId, credCloudName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(credCloudResponse) => Ok(Json.toJson(credCloudResponse))

    }
  }

  /**
    * Get the cloud credential details
    */
  def listAllCloudCred() = AuthenticatedAction.async { request =>
    Logger.info("Received retrieve cloud credential request")
    implicit val token = request.token
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getAllCloudCreds(queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(credCloudResponse) => Ok(Json.toJson(credCloudResponse))

    }
  }

}
