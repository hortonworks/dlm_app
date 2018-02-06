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

import domain.{CommentRepo, PaginatedQuery, SortQuery}
import com.hortonworks.dataplane.commons.domain.Entities.Comment
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._

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

  private def getPaginatedQuery(req: Request[AnyContent]): Option[PaginatedQuery] = {
    val offset = req.getQueryString("offset")
    val size = req.getQueryString("size")

    if (size.isDefined && offset.isDefined) {
      Some(PaginatedQuery(offset.get.toInt, size.get.toInt, None))
    } else None

  }

  def getCommentByObjectRef = Action.async { req =>
    val objectId = req.getQueryString("objectId")
    val objectType  = req.getQueryString("objectType")
    Logger.info("db-service Comments Controller: Received get comment request")
    if(objectId.isEmpty || objectType.isEmpty || !isNumeric(objectId.get)) Future.successful(BadRequest)
    else{
      commentRepo.findByObjectRef(objectId.get.toLong,objectType.get,getPaginatedQuery(req))
        .map{ commentswithuser =>
          success(commentswithuser)
        }.recoverWith(apiError)
    }
  }

  def delete = Action.async { req =>
    val objectId = req.getQueryString("objectId")
    val objectType  = req.getQueryString("objectType")
    Logger.info("db-service Comments Controller: Received delete comment by object reference request")
    if(objectId.isEmpty || objectType.isEmpty || !isNumeric(objectId.get)) Future.successful(BadRequest)
    else{
      val numOfRowsDel = commentRepo.deleteByObjectRef(objectId.get.toLong,objectType.get)
      numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiError)
    }
  }

  def deleteById(id: String) = Action.async { req =>
    Logger.info("db-service Comments controller:  Received delete comment request")
    val userId = req.getQueryString("userId")
    if(userId.isEmpty || !isNumeric(userId.get) || !isNumeric(id)) Future.successful(BadRequest)
    else{
      val commentId = id.toLong
      val futureId = commentRepo.deleteById(commentId, userId.get.toLong)
      futureId.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiError)
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
