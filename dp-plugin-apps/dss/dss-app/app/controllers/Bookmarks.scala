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
import com.hortonworks.dataplane.commons.domain.Entities.{Bookmark}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.{BookmarkService}
import play.api.{Configuration, Logger}
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Bookmarks @Inject()(@Named("bookmarkService") val bookmarkService: BookmarkService,
                           private val config: Configuration)
  extends Controller with JsonAPI {

  def add = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("Bookmarks-Controller: Received add bookmark request")
    val loggedinUser = request.user.id.get
    request.body
      .validate[Bookmark]
      .map { bm =>
        val objectTypes = config.getStringSeq("dss.bookmarks.object.types").getOrElse(Nil)
        if(!objectTypes.contains(bm.objectType)) {
          Logger.warn(s"Bookmarks-Controller: Bookmarks for object type ${bm.objectType} is not supported")
          Future.successful(BadRequest(s"Bookmarks for object type ${bm.objectType} is not supported"))
        }else {
          bookmarkService
            .add(bm.copy(userId = loggedinUser))
            .map { bookmark =>
              Created(Json.toJson(bookmark))
            }
            .recover(apiErrorWithLog(e => Logger.error(s"Bookmarks-Controller: Adding of bookmark $bm failed with message ${e.getMessage}",e)))
        }
      }
      .getOrElse{
        Logger.warn("Bookmarks-Controller: Failed to map request to Bookmark entity")
        Future.successful(BadRequest)
      }
  }

  def deleteById(bmId: Long) = AuthenticatedAction.async { req =>
    Logger.info("Bookmarks-Controller: Received delete bookmark request")
    val loggedinUser = req.user.id.get
    bookmarkService.deleteById(loggedinUser, bmId)
      .map{ msg =>
        Ok(Json.toJson(msg))
      }
      .recover(apiErrorWithLog(e => Logger.error(s"Bookmarks-Controller: Deleting Bookmark with bookmark Id $bmId failed with message ${e.getMessage}", e)))
  }
}
