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
import com.hortonworks.dataplane.commons.domain.Entities
import com.hortonworks.dataplane.commons.domain.Entities.Comment
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.CommentService
import play.api.{Configuration, Logger}
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Comments @Inject()(@Named("commentService") val commentService: CommentService,
                         private val config: Configuration)
  extends Controller {

  def addComments = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("Comments Controller: Received add Comment request for assetCollection")
    request.body
      .validate[Comment]
      .map { comment =>
        val objectTypes = config.getStringSeq("dp.comments.object.types").getOrElse(Nil)
        if(!objectTypes.contains(comment.objectType)) Future.successful(BadRequest)
        else{
          commentService
            .add(comment.copy(createdBy = request.user.id.get))
            .map {
              case Left(errors) =>
                InternalServerError(Json.toJson(errors))
              case Right(comment) =>
                Ok(Json.toJson(comment))
            }
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def updateComments(commentId: String) = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("Comments Controller: Received add Comment request for assetCollection")
    request.body
      .validate[(String, String)]
      .map { case (commentTextWithUser) =>
        val loggedinUser = request.user.id.get
        if(loggedinUser != commentTextWithUser._2) Future.successful(Unauthorized("this user is not authorized to perform this action"))
        else{
          commentService
            .update(commentTextWithUser._1,commentId)
            .map {
              case Left(errors) =>
                InternalServerError(Json.toJson(errors))
              case Right(comment) =>
                Ok(Json.toJson(comment))
            }
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  implicit val tupledCommentTextWithUserReads = (
    (__ \ 'commentText).read[String] and
    (__ \ 'userId).read[String]
  ) tupled

  def getByObjectRef = Action.async { req =>
    val objectId = req.getQueryString("objectId")
    val objectType  = req.getQueryString("objectType")
    val objectTypes = config.getStringSeq("dp.comments.object.types").getOrElse(Nil)
    if(objectId.isEmpty || objectType.isEmpty || !objectTypes.contains(objectType.get)) Future.successful(BadRequest)
    else{
      commentService
        .getByObjectRef(objectId.get, objectType.get)
        .map {
          case Left(errors) =>
            InternalServerError(Json.toJson(errors))
          case Right(nestedComments: Seq[Entities.OneLevelComment]) => Ok(Json.toJson(nestedComments))
        }
    }
  }

  private def isNumeric(str: String) = scala.util.Try(str.toLong).isSuccess

  def deleteCommentById(commentId: String) = AuthenticatedAction.async { req =>
    Logger.info("dp-app Comments Controller: Received delete comment request")
    val paramUserId = req.getQueryString("userId")
    val loggedinUser = req.user.id.get
    if(paramUserId.isEmpty || !isNumeric(paramUserId.get) || paramUserId.get.toLong != loggedinUser) Future.successful(Unauthorized("this user is not authorized to perform this action"))
    else{
      commentService.deleteById(commentId,paramUserId.get.toLong)
        .map{
          case Left(errors) =>
            InternalServerError(Json.toJson(errors))
          case Right(msg) =>
            Ok(Json.toJson(msg))
        }
    }

  }
}
