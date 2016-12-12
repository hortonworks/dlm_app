package controllers

import com.google.inject.Inject
import com.hw.dp.service.cluster.DataConstraints
import com.hw.dp.services.atlas.AtlasHiveApi
import internal.AtlasApiCache
import internal.auth.Authenticated
import internal.persistence.DataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


/**
  * Get settings to show in various parts of the APP
  */
class Atlas @Inject() (val atlasApiCache:AtlasApiCache,storage: DataStorage) extends Controller {


  import com.hw.dp.services.atlas.Hive._
  def getAllTables(clusterHost:String,datacenter:String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).map { api =>
        Ok(Json.toJson(api.fastLoadAllTables))
    }.recoverWith{
      case e:Exception => Future.successful(InternalServerError(JsonResponses.statusError("fetch error",e.getMessage)))
    }
  }

  private def getApi(clusterHost: String, datacenter: String): Future[AtlasHiveApi] = {
    for {
      ambari <- storage.loadCluster(clusterHost, datacenter)
      cluster <- storage.loadClusterInformation(clusterHost, datacenter)
      api <- atlasApiCache.getApi(ambari.get, cluster.get)
    } yield {
      api
    }
  }
}
