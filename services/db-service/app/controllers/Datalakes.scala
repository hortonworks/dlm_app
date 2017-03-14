package controllers

import javax.inject._

import domain.DataLakeRepo
import domain.Entities.{Datalake, Location}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Datalakes @Inject()(dataLakeRepo: DataLakeRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {

  import domain.API._
  import domain.JsonFormatters._

  def all = Action.async {
    dataLakeRepo.all.map { dl =>
      val datums = dl.map(d => linkData(d, makeLink(d)))
      success(datums)
    }.recoverWith(apiError)
  }

  def addLocation = Action.async(parse.json) { req =>
    req.body
      .validate[Location]
      .map { l =>
        val created = dataLakeRepo.addLocation(l)
        created.map(r => success(r)).recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def getLocations = Action.async {
    dataLakeRepo.getLocations.map(success(_)).recoverWith(apiError)
  }

  def loadLocation(id:Long) = Action.async {
    dataLakeRepo.getLocation(id).map(l => l.map(success(_)).getOrElse(NotFound)).recoverWith(apiError)
  }

  def deleteLocation(id:Long) = Action.async {
    dataLakeRepo.deleteLocation(id).map(success(_)).recoverWith(apiError)
  }

  private def makeLink(d: Datalake) = {
    Map("createdBy" -> s"${users}/${d.createdBy.get}",
        "location" -> s"${locations}/${d.location.getOrElse(0)}")
  }

  def load(datalakeId:Long) = Action.async {
    dataLakeRepo.findById(datalakeId).map { dlo =>
      dlo.map { dl =>
        success(linkData(dl, makeLink(dl)))
      }
        .getOrElse(NotFound)
    }.recoverWith(apiError)
  }

  def delete(datalakeId: Long) = Action.async { req =>
    val future = dataLakeRepo.deleteById(datalakeId)
    future.map(i => success(i)).recoverWith(apiError)
  }


  def add = Action.async(parse.json) { req =>
    req.body
      .validate[Datalake]
      .map { dl =>
        val created = dataLakeRepo.insert(dl)
        created
          .map(d => success(linkData(d, makeLink(d))))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

}
