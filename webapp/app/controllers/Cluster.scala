package controllers

import javax.inject.Inject

import com.hw.dp.service.cluster.Formatters._
import com.hw.dp.service.cluster.{Ambari, AmbariDatacenter}
import internal.auth.Authenticated
import internal.persistence.DataStorage
import internal.{DataPlaneError, MongoUtilities}
import models.JsonResponses
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Cluster @Inject()(val reactiveMongoApi: ReactiveMongoApi,val storage:DataStorage)
  extends Controller with MongoController with ReactiveMongoComponents with MongoUtilities {

  def clusters = database.map(_.collection[JSONCollection]("clusters"))

  def dataCenters = database.map(_.collection[JSONCollection]("datacenters"))

  def insertAmbari(ambari: Ambari): Future[Boolean] = {
    clusters.flatMap(_.find(Json.obj("host" -> ambari.host)).one[JsObject].flatMap { cluster =>
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

  def addCluster = Authenticated.async(parse.json) { req =>
    req.body.validate[AmbariDatacenter].map { adc =>
      dataCenters.flatMap(_.find(Json.obj("name" -> adc.dataCenter.name)).one[JsObject].flatMap { dcJson =>
        dcJson.map { json =>
          insertAmbari(adc.ambari).map { b => Ok }
        }.getOrElse {
          dataCenters.flatMap(_.insert(adc.dataCenter).map(wr =>
            if (wr.ok) {
              insertAmbari(adc.ambari).map { b => Ok }
            } else {
              BadRequest(JsonResponses.statusError("Cannot save Ambari Information"))
            }
          ))
          Future.successful(Ok)
        }
      }
      ).recoverWith {
        case e: DataPlaneError =>
          Future.successful(InternalServerError(JsonResponses.statusError(e.getMessage)))
      }
    }.getOrElse {
      Future.successful(BadRequest(JsonResponses.statusError("Cannot save Ambari Information")))
    }
  }

  def allClusters = Authenticated.async { req =>
    storage.loadAmbari().map{ list =>
      Ok(Json.toJson(list))
    }
  }


}
