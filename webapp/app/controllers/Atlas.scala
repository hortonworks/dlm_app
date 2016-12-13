package controllers

import akka.actor.ActorRef
import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.service.cluster.DataConstraints
import com.hw.dp.services.atlas.AtlasHiveApi
import internal.{AtlasApiCache, GetApi}
import internal.auth.Authenticated
import internal.persistence.DataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import akka.pattern.ask
import akka.util.Timeout

/**
  * Get settings to show in various parts of the APP
  */
class Atlas @Inject() ( @Named("atlasApiCache") val atlasApiCache:ActorRef,storage: DataStorage) extends Controller {


  import com.hw.dp.services.atlas.Hive._
  def getAllTables(clusterHost:String,datacenter:String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).map { api =>
        Ok(Json.toJson(api.fastLoadAllTables))
    }.recoverWith{
      case e:Exception => Future.successful(InternalServerError(JsonResponses.statusError("fetch error",e.getMessage)))
    }
  }



  private def getApi(clusterHost: String, datacenter: String): Future[AtlasHiveApi] = {
    implicit val timeout = Timeout(120 seconds)
    for {
      ambari <- storage.loadCluster(clusterHost, datacenter)
      cluster <- storage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetApi(ambari.get, cluster.get)).mapTo[Future[AtlasHiveApi]].flatMap(f => f )
    } yield {
      api
    }
  }
}
