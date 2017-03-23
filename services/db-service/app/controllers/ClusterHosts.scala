package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{ClusterHost}
import domain.API.clusters
import domain.ClusterHostRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ClusterHosts @Inject()(clusterHostRepo: ClusterHostRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def makeLink(c: ClusterHost) = {
    Map("cluster" -> s"${clusters}/${c.clusterId}")
  }

  def allWithCluster(clusterId:Long) = Action.async {
    clusterHostRepo.allWithCluster(clusterId).map(cs => success(cs.map(c=>linkData(c,makeLink(c))))).recoverWith(apiError)
  }

  def loadWithCluster(clusterId:Long, hostId:Long) = Action.async {
    clusterHostRepo.findByClusterAndHostId(clusterId,hostId).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(clusterId: Long, hostId:Long) = Action.async { req =>
    val future = clusterHostRepo.deleteById(clusterId, hostId)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterHost]
      .map { cl =>
        val created = clusterHostRepo.insert(cl)
        created
          .map(c => success(linkData(c, makeLink(c))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}