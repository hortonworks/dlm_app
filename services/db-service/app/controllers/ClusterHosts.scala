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

import com.hortonworks.dataplane.commons.domain.Entities.ClusterHost
import domain.API.clusters
import domain.ClusterHostRepo
import play.api.libs.json.Json
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
        .getOrElse(notFound)
    }.recoverWith(apiError)
  }

  def find(clusterId:Long,host:String) = Action.async {
    clusterHostRepo.findByHostAndCluster(clusterId,host).map { co =>
      co.map { c =>
        success(linkData(c, makeLink(c)))
      }
        .getOrElse(notFound)
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

  def addOrUpdate = Action.async(parse.json) { req =>
    req.body
      .validate[ClusterHost]
      .map { cl =>
        val created = clusterHostRepo.upsert(cl)
        created
          .map(c => success(Json.obj("updated" -> c)))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
