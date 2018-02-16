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

  def add(userId: Long, datasetId: Long) = Action.async(parse.json) { req =>
    Logger.info("Favourites Controller: Received add favourite request")
    favouriteRepo
      .add(userId, datasetId)
      .flatMap { fav =>
        favouriteRepo.getTotal(fav.datasetId).map { total =>
          success(FavouriteWithTotal(fav,total))
        }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourite Controller: Getting total favourites with dataset Id $datasetId failed with message ${e.getMessage}",e)))
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourite Controller: Adding of favourite with user Id $userId and dataset Id $datasetId failed with message ${e.getMessage}",e)))
  }

  def deleteById(userId: Long, favId: Long, datasetId: Long) = Action.async { req =>
    Logger.info("Favourites Controller: Received delete favourite by id request")
    val numOfRowsDel = favouriteRepo.deleteById(userId,favId)
    numOfRowsDel.flatMap { i =>
      favouriteRepo.getTotal(datasetId).map { total =>
        success(Json.obj("totalFavCount"-> total, "rowsDeleted"-> i))
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourite Controller: Getting total favourites with dataset Id $datasetId failed with message ${e.getMessage}",e)))
    }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourites Controller: Deleting favourite with favourite Id $favId failed with message ${e.getMessage}",e)))
  }

  def deleteByDatasetId(datasetId: Long) = Action.async { req =>
    Logger.info("Favourites Controller: Received delete favourite by dataset Id request")
    val numOfRowsDel = favouriteRepo.deleteByDatasetId(datasetId)
    numOfRowsDel.map(i => success(s"Success: ${i} row/rows deleted")).recoverWith(apiErrorWithLog(e => Logger.error(s"Favourites Controller: Deleting favourites with dataset Id $datasetId failed with message ${e.getMessage}",e)))
  }

  def findByUserAndDatasetId(userId: Long, datasetId: Long) =  Action.async { req =>
    Logger.info("Favourites Controller: Received get favourite by user Id and dataset Id request")
    favouriteRepo.findByUserAndDatasetId(userId, datasetId)
      .map{ fav =>
        success(fav)
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourites Controller: Getting Favourite with user Id $userId and $datasetId failed with message ${e.getMessage}", e)))
  }

  def getTotal(datasetId: Long) = Action.async { req =>
    Logger.info("Favourites Controller: Received get total favourites count request")
    favouriteRepo.getTotal(datasetId)
      .map{ totalFav =>
        success(Json.obj("total" -> totalFav))
      }.recoverWith(apiErrorWithLog(e => Logger.error(s"Favourites Controller: Getting total favourites with dataset Id $datasetId failed with message ${e.getMessage}", e)))
  }

}
