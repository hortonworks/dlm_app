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

import com.hortonworks.dataplane.commons.domain.Entities.UnclassifiedDataset
import domain.API.{dpClusters, users}
import domain.UnclassifiedDatasetRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class UnclassifiedDatasets @Inject()(datasetRepo: UnclassifiedDatasetRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    datasetRepo.all.map(dataset => success(dataset.map(c=>linkData(c,makeLink(c))))).recoverWith(apiError)
  }


  private def makeLink(c: UnclassifiedDataset) = {
    Map("dpCluster" -> s"${dpClusters}/${c.dpClusterId}",
      "users" -> s"${users}/${c.createdBy}")
  }

  def load(datasetId:Long) = Action.async {
    datasetRepo.findById(datasetId).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(datasetId: Long) = Action.async { req =>
    val future = datasetRepo.deleteById(datasetId)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[UnclassifiedDataset]
      .map { cl =>
        val created = datasetRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
