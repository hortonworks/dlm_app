package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.service.cluster.{Ambari, Cluster, DataCenter}
import com.hortonworks.dataplane.commons.service.cluster.Formatters._
import internal.auth.Authenticated
import internal.persistence.ClusterDataStorage
import internal.{AmbariSync, DataPlaneError, MongoUtilities}
import models.JsonResponses
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Clusters @Inject()(val reactiveMongoApi: ReactiveMongoApi, val storage:ClusterDataStorage, val ambariSync: AmbariSync)
  extends Controller with MongoController with ReactiveMongoComponents with MongoUtilities {

  def clusters = database.map(_.collection[JSONCollection]("clusters"))

  def dataCenters = database.map(_.collection[JSONCollection]("datacenters"))

  def insertAmbari(ambari: Ambari): Future[Boolean] = {
    clusters.flatMap(_.find(Json.obj("host" -> ambari.host,"dataCenter"->ambari.dataCenter)).one[JsObject].flatMap { cluster =>
      cluster.map { exists =>
        Future.failed(new DataPlaneError("Cluster exists"))
      }.getOrElse {
        clusters.flatMap(_.insert(ambari).flatMap { wr =>
          if (wr.ok) Future.successful(true)
          else
            Future.failed(new DataPlaneError(extractWriteError(wr)))
        })
      }
    })
  }

  def updateAmbari(ambari: Ambari): Future[Boolean] = {
    clusters.flatMap(_.find(Json.obj("host" -> ambari.host)).one[JsObject].flatMap { cluster =>
      cluster.map { exists =>
        clusters.flatMap(_.update(Json.obj("host" -> ambari.host), ambari).flatMap { wr =>
          if (wr.ok) Future.successful(true)
          else
            Future.failed(new DataPlaneError(extractWriteError(wr)))
        })
      }.getOrElse {
        Future.failed(new DataPlaneError("Cluster doesn't exists"))
      }
    })

  }

  def create = Authenticated.async(parse.json) { req =>
    req.body.validate[Ambari].map { ambari =>
      insertAmbari(ambari).map{ b=>
        //poll data
        ambariSync.clusterAdded
        Ok(JsonResponses.statusOk)
      }.recoverWith {
        case e: DataPlaneError =>
          Future.successful(InternalServerError(JsonResponses.statusError(e.getMessage)))
      }
    }.getOrElse {
      Future.successful(BadRequest(JsonResponses.statusError("Cannot save Ambari Information")))
    }
  }

  def update = Authenticated.async(parse.json) { req =>
    req.body.validate[Ambari].map { ambari =>
      updateAmbari(ambari).map{ b=>
        Ok(JsonResponses.statusOk)
      }.recoverWith {
        case e: DataPlaneError =>
          Future.successful(InternalServerError(JsonResponses.statusError(e.getMessage)))
      }
    }.getOrElse {
      Future.successful(BadRequest(JsonResponses.statusError("Cannot save Ambari Information")))
    }
  }


  def list = Authenticated.async { req =>
    storage.loadAmbari().map{ list =>
      Ok(Json.toJson(list))
    }
  }

  def get(id: String) = Authenticated.async {
    import com.hortonworks.dataplane.commons.service.cluster.Formatters._

    storage.getClusterById(id)
      .map(
        _
          .map(cAmbari => Ok(Json.toJson(cAmbari)))
          .getOrElse(NotFound)
      )
      .recoverWith {
        case e:Exception =>
          Future.successful(InternalServerError(JsonResponses.statusError("Server error",e.getMessage)))
      }

  }

}
