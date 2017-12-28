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
          .map { cll =>
            success(cll)
          }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def getCommentByObjectRef = Action.async { req =>
    val objectId = req.getQueryString("objectId").get.toLong
    val objectType = req.getQueryString("objectType").get

    commentRepo.findByObejctRef(objectId,objectType)
      .map{ commentswithuser =>
        success(commentswithuser)
      }.recoverWith(apiError)
  }

  def deleteById(id: String) = Action.async { req =>
    Logger.info("db-service Comments controller:  Received delete comment request")
    val commentId = id.toLong
    val futureId = commentRepo.deleteById(commentId)
    futureId.map(i => success("Success")).recoverWith(apiError)
  }
}
