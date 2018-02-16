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
import com.hortonworks.dataplane.commons.domain.Entities.{Favourite}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.{ FavouriteService}
import play.api.{Configuration, Logger}
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Favourites @Inject()(@Named("favouriteService") val favouriteService: FavouriteService,
                         private val config: Configuration)
  extends Controller with JsonAPI {

  def add(userId: Long, datasetId: Long) = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("Favourites-Controller: Received add favourite request")
    val loggedinUser = request.user.id.get
    request.body
      .validate[Favourite]
      .map { fav =>
          favouriteService
            .add(loggedinUser, fav.datasetId)
            .map { favc =>
              Created(Json.toJson(favc))
            }
            .recover(apiErrorWithLog(e => Logger.error(s"Favourites-Controller: Adding of favourite $fav failed with message ${e.getMessage}",e)))
        }
      .getOrElse{
        Logger.warn("Favourites-Controller: Failed to map request to Favourite entity")
        Future.successful(BadRequest)
      }
  }

  def deleteById(userId: Long, favId: Long, datasetId: Long) = AuthenticatedAction.async { req =>
    Logger.info("Favourites-Controller: Received delete favourite request")
    val loggedinUser = req.user.id.get
    favouriteService.deleteById(loggedinUser,favId,datasetId)
      .map{ msg =>
        Ok(Json.toJson(msg))
      }
      .recover(apiErrorWithLog(e => Logger.error(s"Favourites-Controller: Deleting Favourite with Favourite Id $favId failed with message ${e.getMessage}", e)))
  }
}
