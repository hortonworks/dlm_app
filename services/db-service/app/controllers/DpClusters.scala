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

import com.hortonworks.dataplane.commons.domain.Entities.{
  DataplaneCluster,
  Location
}
import domain.DpClusterRepo
import play.api.mvc._
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class DpClusters @Inject()(dpClusterRepo: DpClusterRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  import domain.API._

  def all = Action.async { request =>
    if (!request.getQueryString("ambariIp").isEmpty) {
      val amabariIp = request.getQueryString("ambariIp").get
      dpClusterRepo
        .findByAmbariIp(amabariIp)
        .map { dlo =>
          dlo
            .map { dl =>
              success(linkData(dl, makeLink(dl)))
            }
            .getOrElse(NotFound)
        }
        .recoverWith(apiError)
    } else {
      dpClusterRepo.all
        .map { dl =>
          val datums = dl.map(d => linkData(d, makeLink(d)))
          success(datums)
        }
        .recoverWith(apiError)
    }
  }

  def addLocation = Action.async(parse.json) { req =>
    req.body
      .validate[Location]
      .map { l =>
        val created = dpClusterRepo.addLocation(l)
        created.map(r => success(r)).recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def getLocations(query: Option[String]) = Action.async {
    dpClusterRepo.getLocations(query).map(success(_)).recoverWith(apiError)
  }

  def loadLocation(id: Long) = Action.async {
    dpClusterRepo
      .getLocation(id)
      .map(l => l.map(success(_)).getOrElse(NotFound))
      .recoverWith(apiError)
  }

  def updateStatus = Action.async(parse.json) { req =>
    req.body
      .validate[DataplaneCluster]
      .map { dl =>
        dpClusterRepo
          .updateStatus(dl)
          .map(c => success(Map("updated" -> c)))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def deleteLocation(id: Long) = Action.async {
    dpClusterRepo.deleteLocation(id).map(success(_)).recoverWith(apiError)
  }

  private def makeLink(d: DataplaneCluster) = {
    Map("createdBy" -> s"${users}/${d.createdBy.get}",
        "location" -> s"${locations}/${d.location.getOrElse(0)}")
  }

  def load(dpClusterId: Long) = Action.async {
    dpClusterRepo
      .findById(dpClusterId)
      .map { dlo =>
        dlo
          .map { dl =>
            success(linkData(dl, makeLink(dl)))
          }
          .getOrElse(NotFound)
      }
      .recoverWith(apiError)
  }

  def delete(dpClusterId: Long) = Action.async { req =>
    val future = dpClusterRepo.deleteCluster(dpClusterId)
    future.map(i => NoContent).recoverWith(apiError)
  }

  def update = Action.async(parse.json) { req =>
    req.body
      .validate[DataplaneCluster]
      .map { dl =>
        val created = dpClusterRepo.update(dl)
        created
          .map {
            case d @ (_, false) => success(linkData(d._1, makeLink(d._1)))
            case d @ (_, true)  => entityCreated(linkData(d._1, makeLink(d._1)))
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def add = Action.async(parse.json) { req =>
    req.body
      .validate[DataplaneCluster]
      .map { dl =>
        val created = dpClusterRepo.insert(dl)
        created
          .map(d => success(linkData(d, makeLink(d))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
