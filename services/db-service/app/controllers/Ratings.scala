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
          }.recoverWith(apiErrorWithLog(e => Logger.error(s"Ratings Controller: Adding of rating $rating failed with message ${e.getMessage}",e)))
      }
      .getOrElse{
        Logger.warn("Ratings Controller: Failed to map request to Rating entity")
        Future.successful(BadRequest("Failed to map request to Rating entity"))
      }
  }

  def getAverage(objectId: Long, objectType: String) = Action.async { req =>
    Logger.info("dp-service Ratings Controller: Received get average rating request")
    ratingRepo.getAverage(objectId,objectType)
      .map{ avgAndTotalVotes =>
        success(Json.obj("average" -> avgAndTotalVotes._1, "votes" -> avgAndTotalVotes._2))
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Ratings Controller: Get average with object id $objectId & object type $objectType failed with message ${e.getMessage}",e)))
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
            }.recoverWith(apiErrorWithLog(e => Logger.error(s"Ratings Controller: Update rating with rating id $id and rating object $ratingTuple failed with message ${e.getMessage}",e)))
        }
      }
      .getOrElse{
        Logger.warn("Ratings Controller: Failed to map request to Rating tuple")
        Future.successful(BadRequest("Failed to map request to Rating tuple"))
      }
  }

  def get(objectId: Long, objectType: String, userId: Long) = Action.async { req =>
    Logger.info("dp-service Ratings Controller: Received get rating request")
    ratingRepo.get(userId,objectId,objectType)
      .map{ rt =>
        success(rt)
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Ratings Controller: Get rating with user id $userId , object id $objectId and object type $objectType failed with message ${e.getMessage}",e)))
  }

  def delete(objectId: Long, objectType: String) = Action.async { req =>
    Logger.info("db-service Ratings Controller: Received delete ratings by object reference request")
    val numOfRowsDel = ratingRepo.deleteByObjectRef(objectId,objectType)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted"))
      .recoverWith(apiErrorWithLog(e => Logger.error(s"Ratings Controller: Delete rating with object id $objectId and object type $objectType failed with message ${e.getMessage}",e)))
  }

  implicit val tupledRatingWithUserReads = (
    (__ \ 'rating).read[Float] and
      (__ \ 'userId).read[Long]
    ) tupled


}
