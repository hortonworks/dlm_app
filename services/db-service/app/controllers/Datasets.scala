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

import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, DataAsset, DatasetAndTags, DatasetCreateRequest}
import domain.API.{dpClusters, users}
import domain.{DatasetRepo, PaginatedQuery, SortQuery}
import play.api.libs.json.{Json, __}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Datasets @Inject()(datasetRepo: DatasetRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all(name: Option[String]) = Action.async {
    (name match {
      case Some(name) => datasetRepo.findByName(name)
      case None => datasetRepo.all
    }).map(dataset => success(dataset.map(c => linkData(c, makeLink(c))))).recoverWith(apiError)
  }

  private def getPaginatedQuery(req: Request[AnyContent]): Option[PaginatedQuery] = {
    val offset = req.getQueryString("offset")
    val size = req.getQueryString("size")
    val sortCol = req.getQueryString("sortBy")
    val sortOrder = req.getQueryString("sortOrder").getOrElse("asc")

    if (size.isDefined && offset.isDefined) {
      val sortQuery = sortCol.map(s => SortQuery(s, sortOrder))
      Some(PaginatedQuery(offset.get.toInt, size.get.toInt, sortQuery))
    } else None

  }

  private def isNumeric(str: String) = scala.util.Try(str.toLong).isSuccess

  def allRichDataset = Action.async { req =>
    val userId = req.getQueryString("userId")
    val filter = req.getQueryString("filter")
    if(userId.isEmpty || !isNumeric(userId.get)) Future.successful(BadRequest)
    else{
      datasetRepo.getRichDataSet(req.getQueryString("search"), getPaginatedQuery(req),userId.get.toLong, filter)
        .map(dc => success(dc.map(c => linkData(c, makeLink(c.dataset)))))
        .recoverWith(apiError)
    }
  }

  def richDatasetByTag(tagName: String) = Action.async { req =>
    val userId = req.getQueryString("userId")
    val filter = req.getQueryString("filter")
    if(userId.isEmpty || !isNumeric(userId.get)) Future.successful(BadRequest)
    else{
      datasetRepo.getRichDatasetByTag(tagName, req.getQueryString("search"), getPaginatedQuery(req),userId.get.toLong, filter)
        .map(dc => success(dc.map(c => linkData(c, makeLink(c.dataset)))))
        .recoverWith(apiError)
    }
  }

  def richDatasetById(id: Long) = Action.async { req=>
    val userId = req.getQueryString("userId")
    if(userId.isEmpty || !isNumeric(userId.get)) Future.successful(BadRequest)
    else{
      datasetRepo.getRichDatasetById(id,userId.get.toLong).map { co =>
        co.map { c =>
          success(linkData(c, makeLink(c.dataset)))
        }
          .getOrElse(NotFound)
      }.recoverWith(apiError)
    }
  }

  private def makeLink(c: Dataset) = {
    Map("datalake" -> s"${dpClusters}/${c.dpClusterId}",
      "users" -> s"${users}/${c.createdBy.get}")
  }

  def load(datasetId: Long) = Action.async {
    datasetRepo.findByIdWithCategories(datasetId).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c.dataset)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(datasetId: Long) = Action.async { req =>
    val future = datasetRepo.archiveById(datasetId)
    future.map(i => success(i)).recoverWith(apiError)
  }

  def updateDatset(datasetId: String) = Action.async(parse.json) { req =>
    req.body
      .validate[Dataset]
      .map { dataset =>
        if(!isNumeric(datasetId)) Future.successful(BadRequest)
        else {
          datasetRepo.updateDatset(datasetId.toLong, dataset).map{ ds =>
            ds.map { d =>
              success(Json.toJson(d))
            }
              .getOrElse(NotFound)
          }.recoverWith(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[DatasetAndTags]
      .map { cl =>
        val created = datasetRepo.insertWithCategories(cl)
        created.map(c => success(linkData(c)))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def addAssets (datasetId: Long) = Action.async(parse.json) { req =>
    req.body
      .validate[Seq[DataAsset]]
      .map { assets =>
        datasetRepo
          .addAssets(datasetId, assets)
          .map(c => success(linkData(c)))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def removeAssets (datasetId: Long, ids: Seq[String]) = Action.async { req =>
    datasetRepo
      .removeAssets(datasetId, ids)
      .map(c => success(linkData(c)))
      .recoverWith(apiError)
  }

  def removeAllAssets (datasetId: Long) = Action.async { req =>
    datasetRepo
      .removeAllAssets(datasetId)
      .map(c => success(linkData(c)))
      .recoverWith(apiError)
  }

  def addWithAsset = Action.async(parse.json) { req =>
    req.body
      .validate[DatasetCreateRequest]
      .map { cl =>
        val created = datasetRepo.create(cl)
        created.map(c => success(linkData(c, makeLink(c.dataset))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def update = Action.async(parse.json) { req =>
    req.body
      .validate[DatasetAndTags]
      .map { cl =>
        val updated = datasetRepo.updateWithCategories(cl)
        updated.map(c => success(linkData(c)))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def findManagedAssets(clusterId: Long) = Action.async(parse.json) { request =>
    request.body
      .validate[Seq[String]]
      .map { assets =>
        datasetRepo.queryManagedAssets(clusterId, assets)
          .map(result => success(Json.toJson(result)))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
