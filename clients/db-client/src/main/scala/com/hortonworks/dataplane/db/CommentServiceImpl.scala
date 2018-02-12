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

import java.time.{LocalDateTime, ZoneId}
import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.CommentService
import com.typesafe.config.Config
import play.api.Logger
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class CommentServiceImpl(config: Config)(implicit ws: WSClient)
  extends CommentService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def add(comment: Comment): Future[CommentWithUser] = {
    ws.url(s"$url/comments")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(comment))
      .map(mapToCommentWithUser)
  }

  override def deleteById(commentId: String, userId: Long): Future[String] = {
    ws.url(s"$url/comments/$commentId?userId=${userId}")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map{ res =>
        res.status match {
          case 200 => (res.json \ "results").validate[String].get
          case _ =>{
            Logger.warn(s"Db-Client CommentServiceImpl: In deleletById method , result status ${res.status} with comment Id $commentId and userId $userId")
            mapResponseToError(res)
          }
        }
      }
  }

  override def deleteByObjectRef(objectId: String, objectType: String): Future[String] = {
    ws.url(s"$url/comments?objectId=${objectId}&objectType=${objectType}")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map{ res =>
        res.status match {
          case 200 => (res.json \ "results").validate[String].get
          case _ =>
            Logger.warn(s"Db-Client CommentServiceImpl: In deleteByObjectRef, result status ${res.status} with object Id $objectId and object type $objectType")
            mapResponseToError(res)
        }
      }
  }

  override def update(commentText: String, commentId: String): Future[CommentWithUser] = {
    ws.url(s"$url/comments/$commentId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .patch(Json.toJson(commentText))
      .map(mapToCommentWithUser)
  }

  override def getByObjectRef(queryString: String): Future[Seq[CommentWithUser]] = {
    ws.url(s"$url/comments?$queryString")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCommentWithUsers)
  }


  private def mapToCommentWithUser(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").validate[CommentWithUser].get
      case _ => {
        Logger.warn(s"Db-Client CommentServiceImpl: In mapToCommentWithUser method, result status ${res.status}")
        mapResponseToError(res)
      }
    }
  }

  private def mapToCommentWithUsers(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "results").validate[Seq[CommentWithUser]].getOrElse(Seq())
      case _ => {
        Logger.warn(s"Db-Client CommentServiceImpl: In mapToCommentWithUsers method, result status ${res.status}")
        mapResponseToError(res)
      }
    }
  }

}
