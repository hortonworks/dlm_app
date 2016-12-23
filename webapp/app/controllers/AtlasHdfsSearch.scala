package controllers

import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.services.hdfs.{AtlasHdfsApi, Hdfs}
import internal.GetHdfsApi
import internal.auth.Authenticated
import internal.filters.HdfsFilterChain
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._

class AtlasHdfsSearch @Inject()(
    @Named("atlasApiCache") val atlasApiCache: ActorRef,
    clusterStorage: ClusterDataStorage)
    extends Controller {

  import com.hw.dp.services.hdfs.Hdfs._
  import models.Filters._

  implicit val timeout = Timeout(120 seconds)

  def searchFileSets = Authenticated.async(parse.json) { req =>
    val jsResult = req.body.validate[SearchQuery]
    if (jsResult.isError) {
      Future.successful(
        BadRequest(JsonResponses.statusError("Could not parse search query")))
    }
    val searchQuery = jsResult.get

    val tables = for {
      // first warm up cache
      hbaseApi <- getHdfsApi(searchQuery.clusterHost, searchQuery.dataCenter)
      allFiles <- Future.successful(hbaseApi.fastLoadAllFileSets)
      selectedTables <- applySearchQuery(allFiles, searchQuery)
    } yield (selectedTables)

    tables.map(ts => Ok(Json.toJson(ts))).recoverWith {
      case e: Exception =>
        Future.successful(
          InternalServerError(
            JsonResponses.statusError("Server error", e.getMessage)))
    }
  }

  def applySearchQuery(allTables: Seq[Hdfs.Result], searchQuery: SearchQuery) = {
    Future {
      val filterChain = HdfsFilterChain.makeFilterChain(searchQuery)
      filterChain.apply(allTables)
    }

  }

  private def getHdfsApi(clusterHost: String,
                         datacenter: String): Future[AtlasHdfsApi] = {
    for {
      ambari <- clusterStorage.loadCluster(clusterHost, datacenter)
      cluster <- clusterStorage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetHdfsApi(ambari.get, cluster.get))
        .mapTo[Future[AtlasHdfsApi]]
        .flatMap(f => f)
    } yield {
      api
    }
  }

}
