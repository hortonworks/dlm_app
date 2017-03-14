package controllers

import javax.inject._

import domain.API.{datalakes, clusters}
import domain.ClusterServiceRepo
import domain.Entities.ClusterService
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ClusterServices @Inject()(csr: ClusterServiceRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import domain.JsonFormatters._

  def all = Action.async {
    csr.all.map(cs => success(cs.map(c=>linkData(c,makeLink(c))))).recoverWith(apiError)
  }


  private def makeLink(c: ClusterService) = {
    Map("datalake" -> s"${datalakes}/${c.datalakeid.get}",
      "user" -> s"${clusters}/${c.clusterid.get}")
  }

  def load(serviceId:Long) = Action.async {
    csr.findById(serviceId).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(serviceId: Long) = Action.async { req =>
    val future = csr.deleteById(serviceId)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterService]
      .map { cl =>
        val created = csr.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
