package controllers

import akka.actor.ActorRef
import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.service.cluster.DataConstraints
import com.hw.dp.services.atlas.AtlasHiveApi
import internal.{AtlasApiCache, GetHiveApi}
import internal.auth.Authenticated
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import akka.pattern.ask
import akka.util.Timeout
import play.api.cache.Cached

import scala.util.Try

/**
  * Get settings to show in various parts of the APP
  */
class AtlasHive @Inject()(@Named("atlasApiCache") val atlasApiCache:ActorRef, storage: ClusterDataStorage) extends Controller {

  import com.hw.dp.services.atlas.Hive._
  implicit val timeout = Timeout(120 seconds)

  private def fetchError(e: Exception) = {
    Future.successful(InternalServerError(JsonResponses.statusError("fetch error", e.getMessage)))
  }

  def getEntity(clusterHost:String,datacenter:String,guid:String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).map { api =>
      val entity = api.getEntity(guid)
      Ok(entity)
    }.recoverWith{
      case e:Exception => fetchError(e)
    }
  }

  def getAudit(clusterHost:String,datacenter:String,guid:String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).map { api =>
      val entity = api.getAudit(guid)
      Ok(entity)
    }.recoverWith{
      case e:Exception => fetchError(e)
    }
  }


  def getLineage(clusterHost:String,datacenter:String,guid:String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).flatMap { api =>
      api.getLineage(guid).map(l => Ok(Json.toJson(l)))
    }.recoverWith{
      case e:Exception => fetchError(e)
    }
  }

  def getAllTables(clusterHost:String, datacenter:String, cached: String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).map { api =>
        if(shouldUseCache(cached))
        Ok(Json.toJson(api.fastLoadAllTables))
      else {
        val tables = api.allHiveTables
        val results = tables.get.results
        Ok(Json.toJson(results.getOrElse(Seq())))
      }
    }.recoverWith{
      case e:Exception => fetchError(e)
    }
  }

  private def shouldUseCache(cached: String) = {
    Try(cached.toBoolean).getOrElse(false)
  }

  def getTableDefinition(clusterHost:String, datacenter:String, table:String, cached: String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).map { api =>
      if(shouldUseCache(cached))
        Ok(Json.toJson(api.fastFindHiveTable(table)))
      else {
        val tables = api.findHiveTable(table)
        val results = tables.get.results
        Ok(Json.toJson(results.getOrElse(Seq())))
      }
    }.recoverWith{
      case e:Exception => fetchError(e)
    }
  }




  private def getApi(clusterHost: String, datacenter: String): Future[AtlasHiveApi] = {
    for {
      ambari <- storage.loadCluster(clusterHost, datacenter)
      cluster <- storage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetHiveApi(ambari.get, cluster.get)).mapTo[Future[AtlasHiveApi]].flatMap(f => f )
    } yield {
      api
    }
  }
}
