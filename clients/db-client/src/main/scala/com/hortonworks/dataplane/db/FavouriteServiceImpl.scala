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
import com.hortonworks.dataplane.db.Webservice.{FavouriteService}
import com.typesafe.config.Config
import play.api.libs.json.{JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class FavouriteServiceImpl(config: Config)(implicit ws: WSClient)
  extends FavouriteService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def add(userId: Long, objectId: Long, objectType: String): Future[FavouriteWithTotal] = {
    ws.url(s"$url/$userId/favourites/$objectType/$objectId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(Favourite(userId = userId, objectType = objectType, objectId = objectId)))
      .map(mapToFavouriteWithTotal)
  }

  override def deleteById(userId: Long, id:Long, objectId: Long, objectType: String): Future[JsObject] = {
    ws.url(s"$url/$userId/favourites/$objectType/$objectId/$id")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapResultsGeneric)
  }

  private def mapToFavouriteWithTotal(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").as[FavouriteWithTotal]
      case _ => {
        val logMsg = s"Db-Client FavouriteServiceImpl: In mapToFavouriteWithTotal method, result status ${res.status}"
        mapResponseToError(res,Option(logMsg))
      }
    }
  }

  private def mapResultsGeneric(res: WSResponse): JsObject = {
    res.status match {
      case 200 =>
        (res.json \ "results").as[JsObject]
      case _ => {
        val logMsg = s"Db-Client FavouriteServiceImpl: In mapResultsGeneric method, result status ${res.status}"
        mapResponseToError(res,Option(logMsg))
      }
    }
  }
}
