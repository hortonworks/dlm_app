package services

import javax.inject.Inject

import com.google.inject.Singleton
import play.api.libs.json._
import play.api.libs.ws.WSClient
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

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
}
