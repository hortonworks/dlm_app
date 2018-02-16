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

import com.hortonworks.dataplane.commons.domain.Entities.Bookmark
import domain.BookmarkRepo
import play.api.Logger
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Bookmarks @Inject()(bookmarkRepo: BookmarkRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def add = Action.async(parse.json) { req =>
    Logger.info("Bookmarks Controller: Received add bookmark request")
    req.body
      .validate[Bookmark]
      .map { bookmark =>
        bookmarkRepo
          .add(bookmark)
          .map { bm =>
            success(bm)
          }.recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Adding of bookmark with user Id ${bookmark.userId} , object type ${bookmark.objectType} and object Id ${bookmark.objectId} failed with message ${e.getMessage}",e)))
      }
      .getOrElse{
        Logger.warn("Bookmarks Controller: Failed to map request to Bookmark entity")
        Future.successful(BadRequest("Bookmarks Controller: Failed to map request to Bookmarks entity"))
      }
  }

  def deleteById(bmId: Long, userId: Long) = Action.async { req =>
    Logger.info("Bookmarks Controller: Received delete bookmark by id request")
    val numOfRowsDel = bookmarkRepo.deleteById(userId,bmId)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Deleting bookmark with bookmark Id $bmId failed with message ${e.getMessage}",e)))
  }

  def deleteByObjectRef(objectId: Long, objectType: String)= Action.async { req =>
    Logger.info("Bookmarks Controller: Received delete bookmark by object reference request")
    val numOfRowsDel = bookmarkRepo.deleteByobjectRef(objectId, objectType)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Deleting bookmarks with ojbect Id $objectId and object type $objectType failed with message ${e.getMessage}",e)))
  }

}
