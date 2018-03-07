/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package controllers

import javax.inject._

import domain.API.{clusters}
import domain.{ClusterServiceHostsRepo, ClusterServiceRepo}
import com.hortonworks.dataplane.commons.domain.Entities.{
  ClusterService,
  ClusterServiceHost
}
import com.hortonworks.dataplane.commons.domain.Ambari.{ConfigurationInfo,ClusterServiceWithConfigs}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ClusterServices @Inject()(
    csr: ClusterServiceRepo,
    cse: ClusterServiceHostsRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def allWithCluster(clusterId: Long) = Action.async {
    csr
      .allWithCluster(clusterId)
      .map(cs => success(cs.map(c => linkData(c, makeClusterLink(c)))))
      .recoverWith(apiError)
  }

  def allWithDpCluster(dpClusterId: Long) = Action.async {
    csr
      .allWithDpCluster(dpClusterId)
      .map(cs => success(cs.map(c => linkData(c, makeClusterLink(c)))))
      .recoverWith(apiError)
  }


  private def makeClusterLink(c: ClusterService) = {
    Map("cluster" -> s"$clusters/${c.clusterId.get}")
  }

  private def makServiceLink(e: ClusterServiceHost, clusterId: Long) = {
    Map("cluster" -> s"$clusters/$clusterId")
  }

  def load(serviceId: Long) = Action.async {
    csr
      .findById(serviceId)
      .map { co =>
        co.map { c =>
            success(linkData(c, makeClusterLink(c)))
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
        .map(cs => success(cs.map(c => linkData(c, makeClusterLink(c)))))
        .recoverWith(apiError)
    }


  def addWithCluster = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterService]
      .map { cl =>
        //        check if cluster is not null and dp-cluster is null
        if (cl.clusterId.isEmpty)
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
        //        check if cluster is not null and dp-cluster is null
        if (cl.clusterId.isEmpty)
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

  def addWithDpCluster = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterService]
      .map { cl =>
        //        check if cluster is not null and dp-cluster is null
        if (cl.clusterId.isDefined)
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

  def getEndpoints(clusterId: Long, serviceId: Long) = Action.async {
    cse
      .allByClusterAndService(clusterId, serviceId)
      .map(cs =>
        success(cs.map(c => linkData(c, makServiceLink(c, clusterId)))))
      .recoverWith(apiError)
  }

  def   getServiceEndpoints(serviceId: Long) = Action.async {
    cse
      .allByService(serviceId)
      .map(cs => cs match {
          case Some(c) => {
            val properties : Option[ConfigurationInfo] =  c._1.properties match {
              case Some(value) => Some(value.validate[ConfigurationInfo].get)
              case None => None
            }
            success(linkData(ClusterServiceWithConfigs(c._1.id, c._1.servicename, c._1.clusterId, c._2.host, properties), Map()))
          }
          case None => NotFound
        })
      .recoverWith(apiError)
  }


  def getAllServiceEndpoints(serviceName: String) = Action.async {
    cse
      .allByServiceName(serviceName)
      .map(cs => success(cs.map(c => {
          val properties : Option[ConfigurationInfo] =  c._1.properties match {
            case Some(value) => Some(value.validate[ConfigurationInfo].get)
            case None => None
          }
          linkData(ClusterServiceWithConfigs(c._1.id, c._1.servicename, c._1.clusterId, c._2.host, properties), Map())
      }))).recoverWith(apiError)
  }

  def addServiceEndpoint = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterServiceHost]
      .map { ce =>
        // check if cluster is not null and dp-cluster is null
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
      .validate[ClusterServiceHost]
      .map { ce =>
        // check if cluster is not null and dp-cluster is null
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
