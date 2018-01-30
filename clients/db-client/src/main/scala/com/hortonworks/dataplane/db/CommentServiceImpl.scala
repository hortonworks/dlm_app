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
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.annotation.tailrec
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
          case _ =>
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

  override def getByObjectRef(queryString: String): Future[Seq[commentWithUserAndChildren]] = {
    ws.url(s"$url/comments?$queryString")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToOneLevelComments)
  }

  private def mapToOneLevelComments(res: WSResponse)= {
    res.status match {
      case 200 =>
        val commentswithuser = (res.json \ "results").validate[Seq[CommentWithUser]].getOrElse(Seq())
        getOneLevelComments(commentswithuser)
      case _ => {
        mapResponseToError(res)
      }
    }
  }

  private def getOneLevelComments(commentswithuser: Seq[CommentWithUser]): Seq[commentWithUserAndChildren] = {
    val map = commentswithuser.filter(cmnt => cmnt.comment.parentCommentId.isEmpty).map(cmnt => {
      cmnt.comment.id.get -> commentWithUserAndChildren(commentWithUser = cmnt, children = Seq())
    }).toMap
    val oneLevelCommentMap = processOneLevelComments(0,commentswithuser, map)
    oneLevelCommentMap.values.toSeq.sortBy(-_.commentWithUser.comment.createdOn.getOrElse(LocalDateTime.MIN).atZone(ZoneId.systemDefault()).toInstant.toEpochMilli)
  }


  @tailrec
  private def processOneLevelComments(idx: Int,commentswithuser: Seq[CommentWithUser], oneLevelCommentMap: Map[Long, commentWithUserAndChildren]):Map[Long, commentWithUserAndChildren] = {
    if(idx >= commentswithuser.length) oneLevelCommentMap
    else{
      if(commentswithuser(idx).comment.parentCommentId.isEmpty) processOneLevelComments(idx+1,commentswithuser,oneLevelCommentMap)
      else{
        val parentOneLevelComment = oneLevelCommentMap.get(commentswithuser(idx).comment.parentCommentId.get).get
        val comment: commentWithUserAndChildren = commentWithUserAndChildren(commentWithUser = parentOneLevelComment.commentWithUser, children = parentOneLevelComment.children :+ commentswithuser(idx))
        processOneLevelComments(idx+1,commentswithuser, oneLevelCommentMap.updated(commentswithuser(idx).comment.parentCommentId.get, comment))
      }
    }
  }

  private def mapToCommentWithUser(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").validate[CommentWithUser].get
      case _ => mapResponseToError(res)
    }
  }

}
