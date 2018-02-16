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

import domain.BookmarkRepo
import play.api.Logger
import play.api.mvc._

import scala.concurrent.ExecutionContext

@Singleton
class Bookmarks @Inject()(bookmarkRepo: BookmarkRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def add(userId: Long, objectType: String, objectId: Long) = Action.async(parse.json) { req =>
    Logger.info("Bookmarks Controller: Received add bookmark request")
    bookmarkRepo
      .add(userId, objectId, objectType)
      .map { bm =>
        success(bm)
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Adding of bookmark with user Id $userId , object type $objectType and object Id $objectId failed with message ${e.getMessage}",e)))
  }

  def deleteById(userId: Long, objectType: String, objectId: Long, bmId: Long) = Action.async { req =>
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
