package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.ClusterProperties
import domain.API.clusters
import domain.ClusterPropertiesRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ClusterProps @Inject()(clusterPropertiesRepo: ClusterPropertiesRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def makeLink(c: ClusterProperties) = {
    Map("cluster" -> s"${clusters}/${c.clusterId}")
  }

  def allWithCluster(clusterId: Long) = Action.async {
    clusterPropertiesRepo
      .allWithCluster(clusterId)
      .map(cs => success(cs.map(c => linkData(c, makeLink(c)))))
      .recoverWith(apiError)
  }

  def loadWithCluster(clusterId: Long, propertiesId: Long) = Action.async {
    clusterPropertiesRepo
      .findByClusterAndPropertiesId(clusterId, propertiesId)
      .map { co =>
        co.map { c =>
            success(linkData(c, makeLink(c)))
          }
          .getOrElse(NotFound)
      }
      .recoverWith(apiError)
  }

  def delete(clusterId: Long, propertiesId: Long) = Action.async { req =>
    val future = clusterPropertiesRepo.deleteById(clusterId, propertiesId)
    future.map(i => success(i)).recoverWith(apiError)
  }

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterProperties]
      .map { cl =>
        val created = clusterPropertiesRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
