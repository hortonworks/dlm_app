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

import com.hortonworks.dataplane.commons.domain.Entities.FavouriteWithTotal
import domain.FavouriteRepo
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext

@Singleton
class Favourites @Inject()(favouriteRepo: FavouriteRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def add(userId: Long, objectType: String, objectId: Long) = Action.async(parse.json) { req =>
    Logger.info("Favourites Controller: Received add favourite request")
    favouriteRepo
      .add(userId, objectId,objectType)
      .flatMap { fav =>
        favouriteRepo.getTotal(objectId, objectType).map { total =>
          success(FavouriteWithTotal(fav,total))
        }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourite Controller: Getting total favourites with object Id $objectId and object type $objectType failed with message ${e.getMessage}",e)))
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourite Controller: Adding of favourite with user Id $userId , object type $objectType and object Id $objectType failed with message ${e.getMessage}",e)))
  }

  def deleteById(userId: Long, objectType: String, objectId: Long, favId: Long) = Action.async { req =>
    Logger.info("Favourites Controller: Received delete favourite by id request")
    val numOfRowsDel = favouriteRepo.deleteById(userId,favId)
    numOfRowsDel.flatMap { i =>
      favouriteRepo.getTotal(objectId, objectType).map { total =>
        success(Json.obj("totalFavCount"-> total, "rowsDeleted"-> i))
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourite Controller: Getting total favourites with object Id $objectId and object type $objectType failed with message ${e.getMessage}",e)))
    }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourites Controller: Deleting favourite with favourite Id $favId failed with message ${e.getMessage}",e)))
  }

  def deleteByObjectRef(objectId: Long, objectType: String) = Action.async { req =>
    Logger.info("Favourites Controller: Received delete favourite by object Id request")
    val numOfRowsDel = favouriteRepo.deleteByobjectRef(objectId, objectType)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiErrorWithLog(e => Logger.error(s"Favourites Controller: Deleting favourites with object Id $objectId  and object Type $objectType failed with message ${e.getMessage}",e)))
  }

}
