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
import com.hortonworks.dataplane.db.Webservice.{BookmarkService}
import com.typesafe.config.Config
import play.api.libs.json.{Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class BookmarkServiceImpl(config: Config)(implicit ws: WSClient)
  extends BookmarkService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def add(bookmark: Bookmark): Future[Bookmark] = {
    ws.url(s"$url/bookmarks")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(bookmark))
      .map(mapToBookmark)
  }

  override def deleteById(userId: Long, bmId:Long): Future[String] = {
    ws.url(s"$url/bookmarks/$bmId?userId=$userId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map{ res =>
        res.status match {
          case 200 => (res.json \ "results").validate[String].get
          case _ =>
            val logMsg = s"Db-Client BookmarkServiceImpl: In deleteById, result status ${res.status} with user Id $userId and bookmark id $bmId"
            mapResponseToError(res,Option(logMsg))
        }
      }
  }

  private def mapToBookmark(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").as[Bookmark]
      case _ => {
        val logMsg = s"Db-Client BookmarkServiceImpl: In mapToBookmark method, result status ${res.status}"
        mapResponseToError(res,Option(logMsg))
      }
    }
  }

}
