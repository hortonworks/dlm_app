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

  //val Logger = Logger(this.getClass)
  def addComment = Action.async(parse.json) { req =>
    Logger.info("Comments Controller: Received add Comment request")
    req.body
      .validate[Comment]
      .map { comment =>
        commentRepo
          .add(comment)
          .map { cmnt =>
            success(cmnt)
          }.recoverWith(apiErrorWithLog(e => Logger.error(s"Comments Controller: Adding of Comment $comment failed with message ${e.getMessage}",e)))
      }
      .getOrElse{
        Logger.warn("Comments Controller: Failed to map request to Comment entity")
        Future.successful(BadRequest)
      }
  }

  private def isNumeric(str: String) = scala.util.Try(str.toLong).isSuccess

  private def getPaginatedQuery(req: Request[AnyContent]): Option[PaginatedQuery] = {
    val offset = req.getQueryString("offset")
    val size = req.getQueryString("size")

    if (size.isDefined && offset.isDefined) {
      Some(PaginatedQuery(offset.get.toInt, size.get.toInt, None))
    } else None

  }

  def getCommentByObjectRef(objectId: Long, objectType: String) = Action.async { req =>
    Logger.info("Comments Controller: Received get comment by object-reference request")
    commentRepo.findByObjectRef(objectId,objectType,getPaginatedQuery(req))
      .map{ commentswithuser =>
        success(commentswithuser)
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Comments Controller: Getting Comments with object Id $objectId and object Type $objectType failed with message ${e.getMessage}", e)))
  }

  def delete(objectId: Long, objectType: String) = Action.async { req =>
    Logger.info("Comments Controller: Received delete comment by object-reference request")
    val numOfRowsDel = commentRepo.deleteByObjectRef(objectId,objectType)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted"))
      .recoverWith(apiErrorWithLog(e => Logger.error(s"Comments Controller: Deleting Comments with object Id $objectId and object Type $objectType failed with message ${e.getMessage}",e)))
  }

  def deleteById(id: String, userId: Long) = Action.async { req =>
    Logger.info("Comments Controller: Received delete comment by id request")
    if(!isNumeric(id)) {
      Logger.warn(s"Comments Controller: Not a valid Comment Id $id")
      Future.successful(BadRequest)
    }
    else{
      val commentId = id.toLong
      val futureId = commentRepo.deleteById(commentId, userId)
      futureId.map(i => success(s"Success: ${i} row/rows deleted"))
        .recoverWith(apiErrorWithLog(e => Logger.error(s"Comments Controller: Deleting Comment with comment Id $commentId failed with message ${e.getMessage}",e)))
    }
  }

  def update(id: String) = Action.async(parse.json) { req =>
    Logger.info("Comments Controller: Received update comment request")
    req.body
      .validate[(String)]
      .map { case (commentText) =>
        commentRepo
          .update(commentText,id.toLong)
          .map { cmnt =>
            success(cmnt)
          }.recoverWith(apiErrorWithLog(e => Logger.error(s"Comments Controller: Updating comment with comment id $id to $commentText failed with message ${e.getMessage}", e)))
      }
      .getOrElse{
        Logger.warn("Comments Controller: Failed to map request to Comment Text")
        Future.successful(BadRequest)
      }
  }

  implicit val tupledCommentTextReads = ((__ \ 'commentText).read[String])
}
