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
    val queryStringMap = Map(("numResults","200"))
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getAllCloudCreds(queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(credCloudResponse) => Ok(Json.toJson(credCloudResponse))

    }
  }

  /**
    * Get the cloud credential details
    */
  def listAllCloudCredWithPolicies = AuthenticatedAction.async { request =>
    Logger.info("Received retrieve cloud credential request")
    implicit val token = request.token
    val queryStringMap = Map(("numResults","200"))
    val queryString : Map[String,String] = queryStringMap.map { case (k,v) => k -> v.mkString }
    beaconService.getAllCloudCredsWithPolicies(queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(credCloudResponse) => Ok(Json.toJson(credCloudResponse))

    }
  }

}
