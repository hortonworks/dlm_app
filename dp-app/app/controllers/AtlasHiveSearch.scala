package controllers

import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.services.atlas.{AtlasHiveApi, Hive}
import internal.GetHiveApi
import internal.auth.Authenticated
import internal.filters.HiveFilterChain
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._

class AtlasHiveSearch @Inject()(
    @Named("atlasApiCache") val atlasApiCache: ActorRef,
    clusterStorage: ClusterDataStorage)
    extends Controller {

  import com.hw.dp.services.atlas.Hive._
  import models.Filters._

  implicit val timeout = Timeout(120 seconds)

  def searchHiveTables = Authenticated.async(parse.json) { req =>
    val jsResult = req.body.validate[SearchQuery]

    if (jsResult.isError) {
      Future.successful(
        BadRequest(JsonResponses.statusError("Could not parse search query")))

    } else {

      val searchQuery = jsResult.get

      val tables = for {
      // first warm up cache
        hiveApi <- getHiveApi(searchQuery.clusterHost, searchQuery.dataCenter)
        allTables <- Future.successful(hiveApi.fastLoadAllTables)
        selectedTables <- applySearchQuery(allTables, searchQuery)
      } yield (selectedTables)

      tables.map(ts => Ok(Json.toJson(ts))).recoverWith {
        case e: Exception =>
          Future.successful(
            InternalServerError(
              JsonResponses.statusError("Server error", e.getMessage)))
      }
    }
  }

  def applySearchQuery(allTables: Seq[Hive.Result], searchQuery: SearchQuery) = {
    Future {
      val filterChain = HiveFilterChain.makeFilterChain(searchQuery)
      filterChain.apply(allTables)
    }

  }

  private def getHiveApi(clusterHost: String,
                         datacenter: String): Future[AtlasHiveApi] = {
    for {
      ambari <- clusterStorage.loadCluster(clusterHost, datacenter)
      cluster <- clusterStorage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetHiveApi(ambari.get, cluster.get))
        .mapTo[Future[AtlasHiveApi]]
        .flatMap(f => f)
    } yield {
      api
    }
  }

}
