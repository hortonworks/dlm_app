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

import javax.inject._

import domain.RatingRepo
import com.hortonworks.dataplane.commons.domain.Entities.Rating
import play.api.Logger
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Ratings @Inject()(ratingRepo: RatingRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._


  private def isNumeric(str: String) = scala.util.Try(str.toLong).isSuccess

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[Rating]
      .map { rating =>
        ratingRepo
          .add(rating)
          .map { rt =>
            success(rt)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def getAverage = Action.async { req =>
    val objectId = req.getQueryString("objectId")
    val objectType  = req.getQueryString("objectType")
    Logger.info("dp-service Ratings Controller: Received get average rating request")
    if(objectId.isEmpty || objectType.isEmpty || !isNumeric(objectId.get)) Future.successful(BadRequest)
    else{
      ratingRepo.getAverage(objectId.get.toLong,objectType.get)
        .map{ avgAndTotalVotes =>
          success(Json.obj("average" -> avgAndTotalVotes._1, "votes" -> avgAndTotalVotes._2))
        }.recoverWith(apiError)
    }
  }

  def update(id: String) = Action.async(parse.json) { req =>
    req.body
      .validate[(Float, Long)]
      .map { ratingTuple =>
        if(!isNumeric(id)) Future.successful(BadRequest)
        else{
          ratingRepo
            .update(id.toLong,ratingTuple._2,ratingTuple._1)
            .map { rt =>
              success(rt)
            }.recoverWith(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def get = Action.async { req =>
    val objectId = req.getQueryString("objectId")
    val objectType  = req.getQueryString("objectType")
    val userId  = req.getQueryString("userId")
    Logger.info("dp-service Ratings Controller: Received get rating request")
    if(objectId.isEmpty || objectType.isEmpty || !isNumeric(objectId.get) || userId.isEmpty || !isNumeric(userId.get)) Future.successful(BadRequest)
    else{
      ratingRepo.get(userId.get.toLong,objectId.get.toLong,objectType.get)
        .map{ rt =>
          success(rt)
        }.recoverWith(apiError)
    }
  }

  implicit val tupledRatingWithUserReads = (
    (__ \ 'rating).read[Float] and
      (__ \ 'userId).read[Long]
    ) tupled


}
