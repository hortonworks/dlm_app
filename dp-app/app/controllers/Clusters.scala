package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.service.cluster.{
  Ambari,
  Cluster,
  DataCenter
}
import com.hortonworks.dataplane.commons.service.cluster.Formatters._
import internal.auth.Authenticated
import internal.persistence.ClusterDataStorage
import internal.{AmbariSync, DataPlaneError, MongoUtilities}
import models.JsonResponses
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo.{
  MongoController,
  ReactiveMongoApi,
  ReactiveMongoComponents
}
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Clusters @Inject()(val reactiveMongoApi: ReactiveMongoApi,
                         val storage: ClusterDataStorage,
                         val ambariSync: AmbariSync)
    extends Controller
    with MongoController
    with ReactiveMongoComponents
    with MongoUtilities {

  def insertAmbari(ambari: Ambari): Future[Boolean] = ???

  def updateAmbari(ambari: Ambari): Future[Boolean] = ???

  def create = Authenticated.async(parse.json) { req =>
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def update = Authenticated.async(parse.json) { req =>
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def list = Authenticated.async { req =>
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def get(id: String) = Authenticated.async {
    Future.successful(Ok(JsonResponses.statusOk))
  }

}
