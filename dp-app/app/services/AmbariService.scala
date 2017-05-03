package services

import javax.inject.Inject

import com.google.inject.Singleton
import com.hortonworks.dataplane.commons.domain.Entities.Datalake
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future
import play.api.Logger

@Singleton
class AmbariService @Inject()(private val wSClient: WSClient,private val configuration: play.api.Configuration) {

  import com.hortonworks.dataplane.commons.domain.Ambari._

  private val clusterService = configuration.underlying.getString("dp.services.cluster.service.uri")

  def statusCheck(ambariEndpoint: AmbariEndpoint):Future[Int] = {
     wSClient.url(s"$clusterService/ambari/status")
       .post(Json.toJson(ambariEndpoint)).map { response =>
       if(response.status == 200)
       (response.json \ "results"\ "data" \ "status").as[Int]
       else
        response.status
     }
  }
  def syncCluster(datalake: Datalake): Future[Boolean] = {
    wSClient
      .url(s"$clusterService/datalake/sync")
      .post(Json.toJson(datalake))
      .map { response =>
        if (response.status == 200) {
          Logger.info(s"Successuly synced datalake with ${datalake.id}")
          true
        } else {
          Logger.info(
            s"Sync failure datalake with id ${datalake.id} Details: ${response}")
          false
        }
      }
  }

}
