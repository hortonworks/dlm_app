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

import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import domain.CommentRepo
import com.hortonworks.dataplane.commons.domain.Entities.Comment
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import play.mvc.BodyParser.Json

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Comments @Inject()(commentRepo: CommentRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def addComment = Action.async(parse.json) { req =>
    req.body
      .validate[Comment]
      .map { comment =>
        commentRepo
          .add(comment)
          .map { cmnt =>
            success(cmnt)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  private def isNumeric(str: String) = scala.util.Try(str.toLong).isSuccess

  def getCommentByObjectRef = Action.async { req =>
    val objectId = req.getQueryString("objectId")
    val objectType  = req.getQueryString("objectType")
    if(objectId.isEmpty || objectType.isEmpty || !isNumeric(objectId.get)) Future.successful(BadRequest)
    else{
      commentRepo.findByObejctRef(objectId.get.toLong,objectType.get)
        .map{ commentswithuser =>
          success(commentswithuser)
        }.recoverWith(apiError)
    }
  }

  def deleteById(id: String) = Action.async { req =>
    Logger.info("db-service Comments controller:  Received delete comment request")
    if(!isNumeric(id)) Future.successful(BadRequest)
    else{
      val commentId = id.toLong
      val futureId = commentRepo.deleteById(commentId)
      futureId.map(i => success("Success")).recoverWith(apiError)
    }
  }

  def update(id: String) = Action.async(parse.json) { req =>
    Logger.info("db-service Comments controller:  Received update comment request")
    req.body
      .validate[(String)]
      .map { case (commentText) =>
        commentRepo
          .update(commentText,id.toLong)
          .map { cmnt =>
            success(cmnt)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  implicit val tupledCommentTextReads = ((__ \ 'commentText).read[String])
}
