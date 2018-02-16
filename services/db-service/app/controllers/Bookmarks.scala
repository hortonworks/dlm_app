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

  def add(userId: Long, datatsetId: Long) = Action.async(parse.json) { req =>
    Logger.info("Bookmarks Controller: Received add bookmark request")
    bookmarkRepo
      .add(userId, datatsetId)
      .map { bm =>
        success(bm)
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Adding of bookmark with user Id $userId and dataset Id $datatsetId failed with message ${e.getMessage}",e)))
  }

  def deleteById(userId: Long, bmId: Long) = Action.async { req =>
    Logger.info("Bookmarks Controller: Received delete bookmark by id request")
    val numOfRowsDel = bookmarkRepo.deleteById(userId,bmId)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Deleting bookmark with bookmark Id $bmId failed with message ${e.getMessage}",e)))
  }

  def deleteByDatasetId(datasetId: Long) = Action.async { req =>
    Logger.info("Bookmarks Controller: Received delete bookmark by dataset Id request")
    val numOfRowsDel = bookmarkRepo.deleteByDatasetId(datasetId)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Deleting bookmarks with dataset Id $datasetId failed with message ${e.getMessage}",e)))
  }

  def findByUserAndDatasetId(userId: Long, datasetId: Long) =  Action.async { req =>
    Logger.info("Bookmarks Controller: Received get bookmark by user Id request and dataset Id")
    bookmarkRepo.findByUserAndDatasetId(userId, datasetId)
      .map{ bm =>
        success(bm)
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Bookmarks Controller: Getting bookmark with user Id $userId and $datasetId failed with message ${e.getMessage}", e)))
  }

}
