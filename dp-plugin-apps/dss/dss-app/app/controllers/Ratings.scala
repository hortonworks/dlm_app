/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.hortonworks.dataplane.commons.domain.Entities.Rating
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.RatingService
import play.api.{Configuration, Logger}
import play.api.libs.json.{__, _}
import play.api.libs.functional.syntax._
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Ratings @Inject()(@Named("ratingService") val ratingService: RatingService,
                        private val config: Configuration)
  extends Controller with JsonAPI {

  val objectTypes = config.getStringSeq("dss.ratings.object.types").getOrElse(Nil)

  def add = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("dss Ratings Controller: Received add rating request")
    request.body
      .validate[Rating]
      .map { rating =>
        if(!objectTypes.contains(rating.objectType)) {
          Logger.warn(s"Ratings-Controller: Ratings for object type ${rating.objectType} is not supported")
          Future.successful(BadRequest("Ratings for object type ${rating.objectType} is not supported"))
        }
        else{
          ratingService
            .add(rating.copy(createdBy = request.user.id.get))
            .map { rt =>
              Created(Json.toJson(rt))
            }
            .recover(apiErrorWithLog(e => Logger.error(s"Ratings Controller: Adding of Rating $rating failed with message ${e.getMessage}",e)))
        }
      }
      .getOrElse{
        Logger.warn("Ratings-Controller: Failed to map request to Rating entity")
        Future.successful(BadRequest("Failed to map request to Rating entity"))
      }
  }

  def get(objectId: String, objectType: String) = AuthenticatedAction.async { req =>
    Logger.info("dss Ratings Controller: Received get rating request")
    if(!objectTypes.contains(objectType)) {
      Logger.warn(s"Ratings-Controller: Ratings for object type ${objectType} is not supported")
      Future.successful(BadRequest(" Ratings for object type ${objectType} is not supported"))
    }
    else {
      ratingService
        .get(req.rawQueryString,req.user.id.get)
        .map { rating =>
          Ok(Json.toJson(rating))
        }
        .recover(apiErrorWithLog(e => Logger.error(s"Ratings-Controller: Get rating with object id $objectId and object type $objectType failed with message ${e.getMessage}",e)))
    }
  }

  def getAverage(objectId: String, objectType: String) = Action.async { req =>
    Logger.info("dss Ratings Controller: Received get-average rating request")
    if(!objectTypes.contains(objectType)) {
      Logger.warn(s"Ratings-Controller: Ratings for object type ${objectType} is not supported")
      Future.successful(BadRequest(" Ratings for object type ${objectType} is not supported"))
    }
    else {
      ratingService
        .getAverage(req.rawQueryString)
        .map { (avgAndVotes: JsObject) =>
          Ok(Json.toJson(avgAndVotes))
        }
        .recover(apiErrorWithLog(e => Logger.error(s"Ratings-Controller: Get average rating with object id $objectId and object type $objectType failed with message ${e.getMessage}",e)))
    }
  }

  def update(ratingId: String) = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("dss Ratings Controller: Received update rating request")
    request.body
      .validate[(Float)]
      .map { rt =>
        ratingService
          .update(ratingId,(rt,request.user.id.get))
          .map { rating =>
            Ok(Json.toJson(rating))
          }
          .recover(apiErrorWithLog(e => Logger.error(s"Ratings-Controller: update of rating with rating id $ratingId failed with message ${e.getMessage}",e)))
      }
      .getOrElse{
        Logger.warn("Ratings-Controller: Failed to map rating from request")
        Future.successful(BadRequest("Failed to map rating from request"))
      }
  }

  implicit val tupledRatingReads = ((__ \ 'rating).read[Float])
}

