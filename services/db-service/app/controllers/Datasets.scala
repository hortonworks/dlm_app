package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, DatasetAndCategoryIds, DatasetCreateRequest}
import domain.API.{dpClusters, users}
import domain.DatasetRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Datasets @Inject()(datasetRepo: DatasetRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    datasetRepo.all.map(dataset => success(dataset.map(c => linkData(c, makeLink(c))))).recoverWith(apiError)
  }

  private def makeLink(c: Dataset) = {
    Map("datalake" -> s"${dpClusters}/${c.dpClusterId}",
      "users" -> s"${users}/${c.createdBy}")
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
    val future = datasetRepo.deleteById(datasetId)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[DatasetAndCategoryIds]
      .map { cl =>
        val created = datasetRepo.insertWithCategories(cl)
        created.map(c => success(linkData(c, makeLink(c.dataset))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
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
      .validate[DatasetAndCategoryIds]
      .map { cl =>
        val created = datasetRepo.updateWithCategories(cl)
        created.map(c => success(linkData(c, makeLink(c.dataset))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
