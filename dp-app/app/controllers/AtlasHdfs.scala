package controllers

import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.services.hdfs.AtlasHdfsApi
import internal.GetHdfsApi
import internal.auth.Authenticated
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.Try


class AtlasHdfs @Inject()(@Named("atlasApiCache") val atlasApiCache: ActorRef,
                          storage: ClusterDataStorage)
    extends Controller {

  import com.hw.dp.services.hdfs.Hdfs._
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

  def getAllFiles(clusterHost: String, datacenter: String, cached: String) =
    Authenticated.async { req =>
      getApi(clusterHost, datacenter).map { api =>
        if (shouldUseCache(cached))
          Ok(Json.toJson(api.fastLoadAllFileSets))
        else {
          val tables = api.loadAllFileSets
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


  private def getApi(clusterHost: String,
                     datacenter: String): Future[AtlasHdfsApi] = {
    for {
      ambari <- storage.loadCluster(clusterHost, datacenter)
      cluster <- storage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetHdfsApi(ambari.get, cluster.get))
        .mapTo[Future[AtlasHdfsApi]]
        .flatMap(f => f)
    } yield {
      api
    }
  }
}
