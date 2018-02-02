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

package com.hortonworks.dataplane.db
import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.RatingService
import com.typesafe.config.Config
import play.api.libs.json.{JsObject, Json, __}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class RatingServiceImpl(config: Config)(implicit ws: WSClient)
  extends RatingService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def add(rating: Rating): Future[Rating] = {
    ws.url(s"$url/ratings")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(rating))
      .map(mapToRating)
  }

  override def get(queryString: String, userId: Long): Future[Rating] = {
    ws.url(s"$url/ratings?$queryString&userId=$userId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToRating)
  }

  override def getAverage(queryString: String): Future[JsObject] = {
    ws.url(s"$url/ratings/actions/average?$queryString")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapResultsGeneric)
  }

  override def update(ratingId: String, ratingUserTuple: (Float, Long)): Future[Rating] = {
    ws.url(s"$url/ratings/$ratingId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .patch(Json.toJson(ratingUserTuple))
      .map(mapToRating)
  }

  import play.api.libs.functional.syntax._

  implicit val tupledRatingWithUserWrite = (
    (__ \ 'rating).write[Float] and
      (__ \ 'userId).write[Long]
    ) tupled

  private def mapToRating(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").validate[Rating].get
      case _ => mapResponseToError(res)
    }
  }

  private def mapResultsGeneric(res: WSResponse): JsObject = {
    res.status match {
      case 200 =>
        (res.json \ "results").as[JsObject]
      case _ => mapResponseToError(res)
    }
  }
}
