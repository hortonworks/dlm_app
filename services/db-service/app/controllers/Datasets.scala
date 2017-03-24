package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Dataset}
import domain.API.{datalakes, users}
import domain.{ClusterRepo, DatasetRepo}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Datasets @Inject()(datasetRepo: DatasetRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all = Action.async {
    datasetRepo.all.map(dataset => success(dataset.map(c=>linkData(c,makeLink(c))))).recoverWith(apiError)
  }


  private def makeLink(c: Dataset) = {
    Map("datalake" -> s"${datalakes}/${c.datalakeId}",
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
      .validate[Dataset]
      .map { cl =>
        val created = datasetRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
