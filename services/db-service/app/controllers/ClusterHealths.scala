package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{ClusterHealth}
import domain.API.clusters
import domain.{ClusterHealthRepo}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ClusterHealths @Inject()(clusterHealthRepo: ClusterHealthRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def makeLink(c: ClusterHealth) = {
    Map("cluster" -> s"${clusters}/${c.clusterId}")
  }

  def allWithCluster(clusterId: Long) = Action.async {
    clusterHealthRepo
      .allWithCluster(clusterId)
      .map { cluster =>
        cluster.map { c =>
          success(linkData(c, makeLink(c)))
        }
        .getOrElse(NotFound)
      }
      .recoverWith(apiError)
  }

  def loadWithCluster(clusterId: Long, healthId: Long) = Action.async {
    clusterHealthRepo.findByClusterAndHealthId(clusterId, healthId).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(clusterId: Long, healthId: Long) = Action.async { req =>
    val future = clusterHealthRepo.deleteById(clusterId, healthId)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterHealth]
      .map { cl =>
        val created = clusterHealthRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
