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

  def allWithDatasetId(datasetId:Long) = Action.async {
    dataAssetRepo.allWithDatasetId(datasetId).map(dataset => success(dataset.map(c=>linkData(c,makeLink(c))))).recoverWith(apiError)
  }


  private def makeLink(c: DataAsset) = {
    Map("dataset" -> s"${API.datasets}/${c.datasetId}"
      )
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
