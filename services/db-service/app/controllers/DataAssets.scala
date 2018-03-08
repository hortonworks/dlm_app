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

import com.hortonworks.dataplane.commons.domain.Entities.{DataAsset, DatasetDetails}
import domain.{API, DataAssetRepo, DatasetDetailsRepo}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class DataAssets @Inject()(dataAssetRepo: DataAssetRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def allWithDatasetId(datasetId:Long, queryName: String, offset: Long, limit: Long, state: Option[String]) = Action.async {
    dataAssetRepo.allWithDatasetId(datasetId, queryName, offset, limit, state).map(aNc => success(linkData(aNc))).recoverWith(apiError)
  }

  def allAssetsWithDatasetId(datasetId: Long): Action[AnyContent] = Action.async {
    dataAssetRepo.allAssetsWithDatasetId(datasetId).map(dataAssets => success(linkData(dataAssets))).recoverWith(apiError)
  }

  private def makeLink(c: DataAsset) = {
    Map("dataset" -> s"${API.datasets}/${c.datasetId}"
      )
  }

  def loadFromGuid(guid: String) = Action.async {
    dataAssetRepo.findByGuid(guid).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def load(id:Long) = Action.async {
    dataAssetRepo.findById(id).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(id: Long) = Action.async { req =>
    val future = dataAssetRepo.deleteById(id)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[DataAsset]
      .map { cl =>
        val created = dataAssetRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
