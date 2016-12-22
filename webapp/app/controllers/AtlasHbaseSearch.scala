package controllers

import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.services.hbase.{AtlasHBaseApi, HBase}
import internal.GetHbaseApi
import internal.auth.Authenticated
import internal.filters.HbaseFilterChain
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._

class AtlasHbaseSearch @Inject()(
    @Named("atlasApiCache") val atlasApiCache: ActorRef,
    clusterStorage: ClusterDataStorage)
    extends Controller {

  import com.hw.dp.services.hbase.HBase._
  import models.Filters._

  implicit val timeout = Timeout(120 seconds)

  def searchHbaseTables = Authenticated.async(parse.json) { req =>
    val jsResult = req.body.validate[SearchQuery]
    if (jsResult.isError) {
       Future.successful(
        BadRequest(JsonResponses.statusError("Could not parse search query")))
    }
    val searchQuery = jsResult.get

    val tables = for {
      // first warm up cache
      hbaseApi <- getHbaseApi(searchQuery.clusterHost, searchQuery.dataCenter)
      allTables <- Future.successful(hbaseApi.fastLoadAllTables)
      selectedTables <- applySearchQuery(allTables, searchQuery)
    } yield (selectedTables)

    tables.map(ts => Ok(Json.toJson(ts))).recoverWith {
      case e: Exception =>
        Future.successful(
          InternalServerError(
            JsonResponses.statusError("Server error", e.getMessage)))
    }
  }

  def applySearchQuery(allTables: Seq[HBase.Result],
                       searchQuery: SearchQuery) = {
    Future {
      val filterChain = HbaseFilterChain.makeFilterChain(searchQuery)
      filterChain.apply(allTables)
    }

  }

  private def getHbaseApi(clusterHost: String,
                         datacenter: String): Future[AtlasHBaseApi] = {
    for {
      ambari <- clusterStorage.loadCluster(clusterHost, datacenter)
      cluster <- clusterStorage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetHbaseApi(ambari.get, cluster.get))
        .mapTo[Future[AtlasHBaseApi]]
        .flatMap(f => f)
    } yield {
      api
    }
  }

}
