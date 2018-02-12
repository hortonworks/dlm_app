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
  def add = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("dss Ratings Controller: Received add rating request")
    request.body
      .validate[Rating]
      .map { rating =>
        val objectTypes = config.getStringSeq("dss.ratings.object.types").getOrElse(Nil)
        if(!objectTypes.contains(rating.objectType)) Future.successful(BadRequest)
        else{
          ratingService
            .add(rating.copy(createdBy = request.user.id.get))
            .map { rt =>
              Created(Json.toJson(rt))
            }
            .recover(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def get = AuthenticatedAction.async { req =>
    Logger.info("dss Ratings Controller: Received get rating request")
    ratingService
      .get(req.rawQueryString,req.user.id.get)
      .map { rating =>
        Ok(Json.toJson(rating))
      }
      .recover(apiError)
  }

  def getAverage = Action.async { req =>
    Logger.info("dss Ratings Controller: Received get-average rating request")
    ratingService
      .getAverage(req.rawQueryString)
      .map { (avgAndVotes: JsObject) =>
        Ok(Json.toJson(avgAndVotes))
      }
      .recover(apiError)
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
          .recover(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  implicit val tupledRatingReads = ((__ \ 'rating).read[Float])
}

