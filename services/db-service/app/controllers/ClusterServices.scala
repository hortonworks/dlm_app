package controllers

import javax.inject._

import domain.API.{clusters, datalakes}
import domain.{ClusterServiceEndpointRepo, ClusterServiceRepo}
import com.hortonworks.dataplane.commons.domain.Entities.{
  ClusterService,
  ClusterServiceEndpoint
}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ClusterServices @Inject()(
    csr: ClusterServiceRepo,
    cse: ClusterServiceEndpointRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def allWithCluster(clusterId: Long) = Action.async {
    csr
      .allWithCluster(clusterId)
      .map(cs => success(cs.map(c => linkData(c, makeClusterLink(c)))))
      .recoverWith(apiError)
  }

  def allWithDatalake(datalakeId: Long) = Action.async {
    csr
      .allWithDatalake(datalakeId)
      .map(cs => success(cs.map(c => linkData(c, makeLink(c)))))
      .recoverWith(apiError)
  }

  private def makeLink(c: ClusterService) = {
    Map("datalake" -> s"$datalakes/${c.datalakeid.get}")
  }
  private def makeClusterLink(c: ClusterService) = {
    Map("cluster" -> s"$clusters/${c.clusterid.get}")
  }

  private def makServiceLink(e: ClusterServiceEndpoint, clusterId: Long) = {
    Map("cluster" -> s"$clusters/$clusterId")
  }

  def load(serviceId: Long) = Action.async {
    csr
      .findById(serviceId)
      .map { co =>
        co.map { c =>
            success(linkData(c, makeLink(c)))
          }
          .getOrElse(NotFound)
      }
      .recoverWith(apiError)
  }

  def delete(serviceId: Long) = Action.async { req =>
    val future = csr.deleteById(serviceId)
    future.map(i => success(i)).recoverWith(apiError)
  }

  def loadWithClusterAndName(clusterId: Long, serviceName: String) =
    Action.async {
      csr
        .findByNameAndCluster(serviceName, clusterId)
        .map(
          cs =>
            cs.map(c => success(linkData(c, makeClusterLink(c))))
              .getOrElse(notFound))
        .recoverWith(apiError)
    }

  def loadWithCluster(serviceId: Long, clusterId: Long) =
    Action.async(parse.json) { req =>
      csr
        .findByIdAndCluster(serviceId, clusterId)
        .map(cs => success(cs.map(c => linkData(c, makeLink(c)))))
        .recoverWith(apiError)
    }

  def loadWithDatalake(serviceId: Long, datalakeId: Long) =
    Action.async(parse.json) { req =>
      csr
        .findByIdAndDatalake(serviceId, datalakeId)
        .map(cs => success(cs.map(c => linkData(c, makeLink(c)))))
        .recoverWith(apiError)
    }

  def addWithCluster = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterService]
      .map { cl =>
        //        check if cluster is not null and datalake is null
        if (cl.clusterid.isEmpty)
          Future.successful(UnprocessableEntity)
        else if (cl.datalakeid.isDefined)
          Future.successful(UnprocessableEntity)
        else {
          val created = csr.insert(cl)
          created
            .map(c => success(linkData(c, makeClusterLink(c))))
            .recoverWith(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))

  }

  def updateWithCluster = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterService]
      .map { cl =>
        //        check if cluster is not null and datalake is null
        if (cl.clusterid.isEmpty)
          Future.successful(UnprocessableEntity)
        else if (cl.datalakeid.isDefined)
          Future.successful(UnprocessableEntity)
        else {
          val created = csr.updateByName(cl)
          created
            .map(c => success(Map("updated" -> c)))
            .recoverWith(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))

  }

  def addWithDatalake = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterService]
      .map { cl =>
        //        check if cluster is not null and datalake is null
        if (cl.clusterid.isDefined)
          Future.successful(UnprocessableEntity)
        else if (cl.datalakeid.isEmpty)
          Future.successful(UnprocessableEntity)
        else {
          val created = csr.insert(cl)
          created
            .map(c => success(linkData(c, makeLink(c))))
            .recoverWith(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))

  }

  def getEndpoints(clusterId: Long, serviceId: Long) = Action.async {
    cse
      .allByClusterAndService(clusterId, serviceId)
      .map(cs =>
        success(cs.map(c => linkData(c, makServiceLink(c, clusterId)))))
      .recoverWith(apiError)
  }

  def addServiceEndpoint = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterServiceEndpoint]
      .map { ce =>
        // check if cluster is not null and datalake is null
        if (ce.serviceid.isEmpty) {
          Future.successful(UnprocessableEntity)
        } else {
          val created = cse.insert(ce)
          created
            .map(c => success(linkData(c)))
            .recoverWith(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def updateServiceEndpoint = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterServiceEndpoint]
      .map { ce =>
        // check if cluster is not null and datalake is null
        if (ce.serviceid.isEmpty) {
          Future.successful(UnprocessableEntity)
        } else {
          val created = cse.updateOrInsert(ce)
          created
            .map(c => success(linkData(c)))
            .recoverWith(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
