/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package controllers

import javax.inject.Inject


import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import services.BeaconService
import models.JsonResponses
import models.Entities.PairClusterRequest
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import models.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Pairs @Inject() (
  val beaconService: BeaconService
) extends Controller {

  /**
    * Get list of all beacon cluster pairing
    */
  def list () = Action.async {
    beaconService.getAllPairedClusters.map {
      pairedClusters => pairedClusters match {
        case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(pairedClusters) => Ok(Json.toJson(pairedClusters))
      }
    }
  }

  /**
    * Pair clusters
    */
  def create () = Action.async (parse.json) { request =>
    Logger.info("Received create pair request")
    request.body.validate[Set[PairClusterRequest]].map { pairClusterRequest =>
      beaconService.pairClusters(pairClusterRequest)
        .map {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(postActionResponse) => Ok(Json.toJson(postActionResponse))
        }
    }.getOrElse(Future.successful(BadRequest))
  }

  /**
    * Unpair clusters
    */
  def unpair () = Action.async (parse.json) { request =>
    Logger.info("Received create pair request")
    request.body.validate[Set[PairClusterRequest]].map { pairClusterRequest =>
      beaconService.unPairClusters(pairClusterRequest)
        .map {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(postActionResponse) => Ok(Json.toJson(postActionResponse))
        }
    }.getOrElse(Future.successful(BadRequest))
  }

}


