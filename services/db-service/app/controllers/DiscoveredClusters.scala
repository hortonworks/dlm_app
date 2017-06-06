package controllers

import javax.inject._

import domain.API.{users, dpClusters}
import domain.ClusterRepo
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class DiscoveredClusters @Inject()(clusterRepo: ClusterRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def all(dpClusterId: Option[Long]) =
    Action.async {
      clusterRepo
        .all(dpClusterId)
        .map(clusters => success(clusters.map(c => linkData(c, makeLink(c)))))
        .recoverWith(apiError)
    }

  def getByDpClusterId(dpClusterId: Long) = Action.async {
    clusterRepo
      .findByDpClusterId(dpClusterId)
      .map(clusters => success(clusters.map(c => linkData(c, makeLink(c)))))
      .recoverWith(apiError)
  }

  private def makeLink(c: Cluster) = {
    Map("dpCluster" -> s"${dpClusters}/${c.dataplaneClusterId.get}",
        "user" -> s"${users}/${c.userid.get}")
  }

  def load(clusterId: Long) = Action.async {
    clusterRepo
      .findById(clusterId)
      .map { co =>
        co.map { c =>
            success(linkData(c, makeLink(c)))
          }
          .getOrElse(NotFound)
      }
      .recoverWith(apiError)
  }

  def delete(clusterId: Long) = Action.async { req =>
    val future = clusterRepo.deleteById(clusterId)
    future.map(i => success(i)).recoverWith(apiError)
  }

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[Cluster]
      .map { cl =>
        val created = clusterRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
