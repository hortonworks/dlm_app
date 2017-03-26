package controllers

import javax.inject.Inject

import internal.MongoUtilities
import internal.auth.Authenticated
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.mvc._
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DataCenters @Inject()(val reactiveMongoApi: ReactiveMongoApi,
                            val storage: ClusterDataStorage)
    extends Controller
    with MongoController
    with ReactiveMongoComponents
    with MongoUtilities {


  def list = Authenticated.async { req =>
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def create = Authenticated.async(parse.json) { req =>
    Future.successful(Ok(JsonResponses.statusOk))
  }
  def getClusters(datacenter: String) = Authenticated.async {
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def get(id: String) = Authenticated.async {
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def getClustersByDataCenterId(id: String) = Authenticated.async {
    Future.successful(Ok(JsonResponses.statusOk))
  }
}
