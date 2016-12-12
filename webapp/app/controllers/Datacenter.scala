package controllers

import javax.inject.Inject

import com.hw.dp.service.cluster.DataCenter
import com.hw.dp.service.cluster.Formatters._
import internal.MongoUtilities
import internal.auth.Authenticated
import internal.persistence.DataStorage
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.api.Cursor
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Datacenter @Inject()(val reactiveMongoApi: ReactiveMongoApi, val storage: DataStorage)
  extends Controller with MongoController with ReactiveMongoComponents with MongoUtilities {

  def dataCenters = database.map(_.collection[JSONCollection]("datacenters"))

  def list = Authenticated.async { req =>
    Logger.info("Received request to get all data-centers")
    dataCenters.flatMap(_.find(Json.obj()).cursor[DataCenter]().collect[List](maxDocs = 0, Cursor.FailOnError[List[DataCenter]]()).flatMap { clusterList =>
      Logger.info(s"Fetched ${clusterList.size} data centers")
      Future.successful(Ok(Json.toJson(clusterList)))
    })
  }


  def create = Authenticated.async(parse.json) { req =>
    Logger.info("Received create data centre request")
    req.body.validate[DataCenter].map { dc =>
      val selector = Json.obj("name" -> dc.name)
      val dcenter = dataCenters.flatMap(_.find(selector).one[DataCenter])
      dcenter.flatMap({ d=>
          if (d.isDefined)
            Future.successful(UnprocessableEntity(JsonResponses.statusError("Datacenter exists")))
          else {
            dataCenters.flatMap(_.insert(dc)).map { wr =>
              if (wr.ok)
                Ok(Json.obj("status"->"success", "errorcode"->0))
              else
                InternalServerError(JsonResponses.statusError("insert error", extractWriteError(wr)))
            }
          }
      })
    }.getOrElse(Future.successful(BadRequest))
  }


//  /**
//    * Gets information for the datacenter
//    * @param datacenter
//    * @return
//    */
//  def getInformation(datacenter: String) = Authenticated.async { req =>
//
//
//
//  }
//












}
