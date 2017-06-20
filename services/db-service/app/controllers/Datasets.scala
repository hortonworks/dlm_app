package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, DatasetAndCategoryIds, DatasetCreateRequest}
import domain.API.{dpClusters, users}
import domain.{DatasetRepo, PaginatedQuery, SortQuery}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Datasets @Inject()(datasetRepo: DatasetRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    datasetRepo.all.map(dataset => success(dataset.map(c => linkData(c, makeLink(c))))).recoverWith(apiError)
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

  def create = Action.async(parse.json) { request =>
    request.body
      .validate[DatasetAndCategoryIds]
      .map { cl =>
        val created = datasetRepo.insertWithCategories(cl)
        created.map(c => success(linkData(c, makeLink(c.dataset))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def allRichDataset = Action.async { req =>
    datasetRepo.getRichDataset(req.getQueryString("search"), getPaginatedQuery(req))
      .map(dc => success(dc.map(c => linkData(c, makeLink(c.dataset)))))
      .recoverWith(apiError)
  }

  def richDatasetByTag(tagName: String) = Action.async { req =>
    datasetRepo.getRichDatasetByTag(tagName, req.getQueryString("search"), getPaginatedQuery(req))
      .map(dc => success(dc.map(c => linkData(c, makeLink(c.dataset)))))
      .recoverWith(apiError)
  }

  def richDatasetById(id: Long) = Action.async {
    datasetRepo.getRichDatasetById(id).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c.dataset)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
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
