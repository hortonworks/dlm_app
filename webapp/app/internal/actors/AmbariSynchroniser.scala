package internal.actors

import java.nio.charset.StandardCharsets
import java.util.Base64

import akka.actor.{Actor, ActorLogging}
import com.hw.dp.service.api.Poll
import com.hw.dp.service.cluster._
import internal.persistence.DataStorage
import play.api.libs.json.JsObject
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

import com.hw.dp.service.cluster.Formatters._

class AmbariSynchroniser(val ambari:Ambari,val storage:DataStorage,ws: WSClient) extends Actor with ActorLogging {

  val clustersApi = "api/v1/clusters"
  val prefix =  s"${ambari.protocol}://${ambari.host}:${ambari.port}/"
  val hostsApi = "hosts"
  val nameNodeApi = "components/NAMENODE"

  override def receive: Receive = {
    case Poll() =>
      // first get all clusters
      val clustersResponse: Future[WSResponse] = getWs(clustersApi).get()
      clustersResponse.map { res =>
        val items = (res.json \ "items" \\ "Clusters").map(_.as[JsObject].validate[Map[String,String]].map(m => Some(m)).getOrElse(None))
         // each item is a Some(cluster)
        // start defining the cluster mapping
        items.foreach { item =>
          item.map { map =>
            // get host information
            val clusterName = map.get("cluster_name")
            val cluster: Cluster = Cluster(clusterName.get, map.get("version").get, ambari.host)
            log.info(s"Discovered cluster ${cluster}")
            val hostsPath: String = s"${clustersApi}/${clusterName.get}/${hostsApi}"
            storage.createOrUpdateCluster(cluster).map { wr =>
              log.info(s"Writing cluster ${wr}")
              val hostsResponse: Future[WSResponse] = getWs(hostsPath).get()
              //Insert Cluster Info
              hostsResponse.map { hres =>
                val hostsList = (hres.json \ "items" \\ "Hosts").map(_.as[JsObject].validate[Map[String, String]].map(m => Some(m)).getOrElse(None))
                hostsList.foreach { hostOpt =>
                  hostOpt.map { host =>
                    // for each host get host and disk info
                    val hostInfoResponse: Future[WSResponse] = getWs(s"${hostsPath}/${host.get("host_name").get}").get()
                    hostInfoResponse.map { hir =>
                      val hostNode = hir.json \ "Hosts"
                      val cpus = (hostNode \ "cpu_count").validate[Int].map(s => Some(s)).getOrElse(None)
                      val state = (hostNode \ "host_state").validate[String].map(s => s).getOrElse("")
                      val status = (hostNode \ "host_status").validate[String].map(s => s).getOrElse("")
                      val ip = (hostNode \ "ip").validate[String].map(s => s).getOrElse("")
                      val diskInfo = (hostNode \ "disk_info").validate[List[Map[String, String]]].map(s => s).getOrElse(List[Map[String, String]]())
                      val diskInfoes: List[DiskInfo] = diskInfo.map(di => DiskInfo(di.get("available"), di.get("device"), di.get("used"), di.get("percentage"), di.get("size"), di.get("mountpoint")))
                      val newHost = Host(host.get("host_name").get, clusterName.get, ambari.host, state, status, ip, cpus, Some(diskInfoes))
                      storage.createOrUpdateHost(newHost).map(wrh => log.info(s"Writing host ${wrh}"))
                    }
                  }
                }
                //  get Uptime from NameNode
                val nameNodeResponse = getWs(s"${clustersApi}/${clusterName.get}/${nameNodeApi}").get()
                nameNodeResponse.map { nnr =>
                  val startTime = (nnr.json \ "ServiceComponentInfo" \ "StartTime").validate[Long].map(l => l).getOrElse(0L)
                  val nameNodeInfo = NameNode(clusterName.get, ambari.host, startTime)
                  //TODO:Get NameNodeInfo

                }

              }
            }
          }
        }
      }
  }

  def getWs(api: String): WSRequest = {
    val creds: String = s"${ambari.credentials.userName}:${ambari.credentials.password}"
    ws.url(s"${prefix}${api}").withHeaders("Content-Type" -> "application/json", "X-Requested-By" -> "ambari",
      "Authorization" -> s"Basic ${Base64.getEncoder.encodeToString(creds.getBytes(StandardCharsets.UTF_8))}")
  }
}
