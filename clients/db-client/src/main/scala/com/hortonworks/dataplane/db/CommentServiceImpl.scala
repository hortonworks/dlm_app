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
    ws.url(s"$url/comments/$commentId")
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

  override def getByObjectRef(objectId: String, objectType: String): Future[Seq[OneLevelComment]] = {
    ws.url(s"$url/comments?objectId=$objectId&objectType=$objectType")
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

  private def getOneLevelComments(commentswithuser: Seq[CommentWithUser]): Seq[OneLevelComment] = {
    val map = commentswithuser.filter(cmnt => cmnt.comment.parentCommentId.isEmpty).map(cmnt => {
      cmnt.comment.id.get -> OneLevelComment(commentWithUser = cmnt, children = Seq())
    }).toMap
    val oneLevelCommentMap = processOneLevelComments(0,commentswithuser, map)
    oneLevelCommentMap.values.toSeq.sortBy(_.commentWithUser.comment.createdOn.getOrElse(LocalDateTime.MIN).atZone(ZoneId.systemDefault()).toInstant.toEpochMilli)
  }

  private def processOneLevelComments(idx: Int,commentswithuser: Seq[CommentWithUser], oneLevelCommentMap: Map[Long, OneLevelComment]):Map[Long, OneLevelComment] = {
    if(idx >= commentswithuser.length) oneLevelCommentMap
    else{
      if(commentswithuser(idx).comment.parentCommentId.isEmpty) processOneLevelComments(idx+1,commentswithuser,oneLevelCommentMap)
      else{
        val parentOneLevelComment = oneLevelCommentMap.get(commentswithuser(idx).comment.parentCommentId.get).get
        val comment: OneLevelComment = OneLevelComment(commentWithUser = parentOneLevelComment.commentWithUser, children = parentOneLevelComment.children :+ commentswithuser(idx))
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

  private def mapToNestedComments(res: WSResponse): Seq[NestedComment] = {
    res.status match {
      case 200 =>
        val commentswithuser = (res.json \ "results").validate[Seq[CommentWithUser]].getOrElse(Seq())
        getNestedComments(commentswithuser)
      case _ => mapResponseToError(res)
    }
  }

  /*Below code is for nested comments.
   *Not used now, will remove it once its sure that fully nested comment will not be used*/

  private def getNestedComments(commentswithuser: Seq[CommentWithUser]) = {
    val nestedCommentsList = commentswithuser.map{ comntwu =>                     // actually, this step is not needed. It can be combined with next step
      NestedComment(comment=comntwu.comment, children= Seq(),userName = comntwu.userName)
    }
    val map = nestedCommentsList.map(nCmnt => nCmnt.comment.id.get -> nCmnt).toMap
    val nestedCommentsMap: Map[Long, NestedComment] = processNestedComments(0,commentswithuser,map)

    val resSeq = nestedCommentsMap.values.toSeq.map{ nestedComment =>
      if(nestedComment.comment.parentCommentId.isEmpty){
        func1(nestedComment,nestedCommentsMap)
      }
      else nestedComment
    }
    resSeq.filter(nestedComment => (nestedComment.comment.parentCommentId.isEmpty))
  }

  private def processNestedComments(idx: Int, commentswithuser:Seq[CommentWithUser],nestedCommentsMap: Map[Long, NestedComment]):Map[Long, NestedComment] = {
    if(idx >= commentswithuser.length) nestedCommentsMap
    else{
      if(commentswithuser(idx).comment.parentCommentId.isEmpty) processNestedComments(idx+1,commentswithuser,nestedCommentsMap)
      else{
        val nestedComment = nestedCommentsMap.get(commentswithuser(idx).comment.id.get).get
        val parentNestedComment = nestedCommentsMap.get(commentswithuser(idx).comment.parentCommentId.get).get
        val nestedComment1 = NestedComment(comment = parentNestedComment.comment, children = parentNestedComment.children :+ nestedComment, userName = parentNestedComment.userName)
        val updatedNestedComment = nestedCommentsMap.updated(parentNestedComment.comment.id.get, nestedComment1)
        processNestedComments(idx+1,commentswithuser,updatedNestedComment)
      }
    }
  }

  private def func1(nestedComment: NestedComment,nestedCommentsMap: Map[Long, NestedComment]): NestedComment = {
    val currentChildren = nestedCommentsMap.get(nestedComment.comment.id.get).get.children
    if(currentChildren.isEmpty) NestedComment(comment = nestedComment.comment,children = Seq(),userName = nestedComment.userName)
    else NestedComment(comment = nestedComment.comment,children = func2(0,currentChildren,nestedCommentsMap),userName = nestedComment.userName)
  }

  private def func2(idx:Int, nestedComments: Seq[NestedComment], nestedCommentsMap: Map[Long, NestedComment]): Seq[NestedComment] = {
    if(idx >= nestedComments.length) Seq()
    else func2(idx+1,nestedComments,nestedCommentsMap) :+ func1(nestedComments(idx),nestedCommentsMap)
  }

  private def mapToComments(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "results").validate[Seq[Comment]].getOrElse(Seq())
      case _ => mapResponseToError(res)
    }
  }

  private def mapToComment(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").validate[Comment].get
      case _ => mapResponseToError(res)
    }
  }

}
