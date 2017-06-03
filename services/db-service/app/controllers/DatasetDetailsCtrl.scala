package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, DatasetDetails}
import domain.API.{dpClusters, users}
import domain.{API, DatasetDetailsRepo, DatasetRepo}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class DatasetDetailsCtrl @Inject()(datasetDetailsRepo: DatasetDetailsRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def allWithDatasetId(datasetId:Long) = Action.async {
    datasetDetailsRepo.allWithDatasetId(datasetId).map(dataset => success(dataset.map(c=>linkData(c,makeLink(c))))).recoverWith(apiError)
  }


  private def makeLink(c: DatasetDetails) = {
    Map("dataset" -> s"${API.datasets}/${c.datasetId}"
      )
  }

  def load(id:Long) = Action.async {
    datasetDetailsRepo.findById(id).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(id: Long) = Action.async { req =>
    val future = datasetDetailsRepo.deleteById(id)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[DatasetDetails]
      .map { cl =>
        val created = datasetDetailsRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
