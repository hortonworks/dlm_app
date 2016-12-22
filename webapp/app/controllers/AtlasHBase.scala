package controllers

import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.services.atlas.AtlasHiveApi
import com.hw.dp.services.hbase.AtlasHBaseApi
import internal.{GetHbaseApi, GetHiveApi}
import internal.auth.Authenticated
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.Try

/**
  * Get settings to show in various parts of the APP
  */
class AtlasHBase @Inject()(@Named("atlasApiCache") val atlasApiCache: ActorRef,
                           storage: ClusterDataStorage)
    extends Controller {

  import com.hw.dp.services.hbase.HBase._
  implicit val timeout = Timeout(120 seconds)

  private def fetchError(e: Exception) = {
    Future.successful(
      InternalServerError(
        JsonResponses.statusError("fetch error", e.getMessage)))
  }

  def getEntity(clusterHost: String, datacenter: String, guid: String) =
    Authenticated.async { req =>
      getApi(clusterHost, datacenter).map { api =>
        val entity = api.getEntity(guid)
        Ok(entity)
      }.recoverWith {
        case e: Exception => fetchError(e)
      }
    }

  def getAudit(clusterHost: String, datacenter: String, guid: String) =
    Authenticated.async { req =>
      getApi(clusterHost, datacenter).map { api =>
        val entity = api.getAudit(guid)
        Ok(entity)
      }.recoverWith {
        case e: Exception => fetchError(e)
      }
    }

  def getAllTables(clusterHost: String, datacenter: String, cached: String) =
    Authenticated.async { req =>
      getApi(clusterHost, datacenter).map { api =>
        if (shouldUseCache(cached))
          Ok(Json.toJson(api.fastLoadAllTables))
        else {
          val tables = api.allHBaseTables
          val results = tables.get.results
          Ok(Json.toJson(results.getOrElse(Seq())))
        }
      }.recoverWith {
        case e: Exception => fetchError(e)
      }
    }

  private def shouldUseCache(cached: String) = {
    Try(cached.toBoolean).getOrElse(false)
  }

  def getTableDefinition(clusterHost: String,
                         datacenter: String,
                         table: String,
                         cached: String) = Authenticated.async { req =>
    getApi(clusterHost, datacenter).map { api =>
      if (shouldUseCache(cached))
        Ok(Json.toJson(api.fastFindHBaseTable(table)))
      else {
        val tables = api.findHBaseTable(table)
        val results = tables.get.results
        Ok(Json.toJson(results.getOrElse(Seq())))
      }
    }.recoverWith {
      case e: Exception => fetchError(e)
    }
  }

  private def getApi(clusterHost: String,
                     datacenter: String): Future[AtlasHBaseApi] = {
    for {
      ambari <- storage.loadCluster(clusterHost, datacenter)
      cluster <- storage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetHbaseApi(ambari.get, cluster.get))
        .mapTo[Future[AtlasHBaseApi]]
        .flatMap(f => f)
    } yield {
      api
    }
  }
}
