package internal.actors

import java.nio.charset.StandardCharsets
import java.util.Base64

import akka.actor.{Actor, ActorLogging}
import com.hw.dp.service.api.Poll
import com.hw.dp.service.cluster._
import internal.DataPlaneError
import internal.persistence.DataStorage
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.ws.{WSClient, WSRequest}

import scala.concurrent.ExecutionContext.Implicits.global

class ClusterHealthSync(val storage: DataStorage, ws: WSClient) extends Actor with ActorLogging {

  val clustersApi = "api/v1/clusters"

  val loadApi = "?fields=metrics/load"

  override def receive: Receive = {

    case Poll() =>

      storage.loadClusterInfos().map { ambariClusters =>
        ambariClusters.map { ac =>
          // get load average from metrics
          val prefix = s"${ac.ambari.protocol}://${ac.ambari.host}:${ac.ambari.port}/"
          ac.clusters.map { cls =>
            cls.map { cl =>
              val now = DateTime.now()
              val timeNow = now.getMillis
              val timeOneMinBack = now.minusHours(1).getMillis
              val metricsSuffix = s"$loadApi[$timeOneMinBack,$timeNow,15]"
              val api = s"$clustersApi/${cl.name}${metricsSuffix}"

              for{
                res <- getWs(prefix,ac.ambari,api).get()
              } yield {
                val response = res.json
                val metrics = (response \ "metrics" \ "load" \ "1-min").as[List[List[Double]]]
                val flatList = metrics.flatten
                val loads = flatList.zipWithIndex.collect{case (e,i)  if ((i+1)%2 != 0) => e}
                val avgLoad = loads.map(v => v).sum / loads.size
                val metric = ClusterMetric(cl.name,cl.ambariHost,cl.dataCenter,0L,0,0,0L)
                storage.saveMetrics(metric)
              }
            }
          }
        }
      }.recoverWith{
        case e:Exception =>
          Logger.error("Excption while pulling Metrics",e)
          throw new DataPlaneError(e.getMessage)
      }
  }

  def getWs(prefix:String,ambari:Ambari,api: String): WSRequest = {
    val creds: String = s"${ambari.credentials.userName}:${ambari.credentials.password}"
    ws.url(s"${prefix}${api}").withHeaders("Content-Type" -> "application/json", "X-Requested-By" -> "ambari",
      "Authorization" -> s"Basic ${Base64.getEncoder.encodeToString(creds.getBytes(StandardCharsets.UTF_8))}")
  }
}
