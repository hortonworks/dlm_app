package internal.actors

import java.nio.charset.StandardCharsets
import java.util.Base64

import akka.actor.{Actor, ActorLogging}
import com.hortonworks.dataplane.commons.service.api.Poll
import com.hortonworks.dataplane.commons.service.cluster._
import internal.DataPlaneError
import internal.persistence.ClusterDataStorage
import play.api.Logger
import play.api.libs.json.JsObject
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AmbariSync(val ambari:Ambari, val storage:ClusterDataStorage, ws: WSClient) extends Actor with ActorLogging {

  val clustersApi = "api/v1/clusters"
  val prefix =  s"${ambari.protocol}://${ambari.host}:${ambari.port}/"
  val hostsApi = "hosts"
  val nameNodeApi = "components/NAMENODE"

  override def receive: Receive = {
    case Poll() =>
      // first get all clusters
      val clustersResponse: Future[WSResponse] = getWs(clustersApi).get()
      clustersResponse.map { res =>
        Logger.info(s"Response from Ambari ${res}")
        val items = (res.json \ "items" \\ "Clusters").map(_.as[JsObject].validate[Map[String,String]].map(m => Some(m)).getOrElse(None))
         // each item is a Some(cluster)
        // start defining the cluster mapping
        items.foreach { item =>
          item.map { map =>
            // get host information
            val clusterName = map.get("cluster_name")
            val cluster: Cluster = Cluster(clusterName.get, map.get("version").get, ambari.host,ambari.dataCenter)
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
                      val newHost = Host(host.get("host_name").get, clusterName.get, ambari.host, ambari.dataCenter,state, status, ip, cpus, Some(diskInfoes))
                      storage.updateAllHosts(newHost).map(wrh => log.info(s"Writing host ${wrh}"))
                    }
                  }
                }
                //  get Uptime from NameNode
                val nameNodeResponse = getWs(s"${clustersApi}/${clusterName.get}/${nameNodeApi}").get()
                nameNodeResponse.map { nnr =>
                  val serviceComponent = nnr.json \ "ServiceComponentInfo"
                  val startTime = (serviceComponent \ "StartTime").validate[Long].map(l => l).getOrElse(0L)
                  val capacityUsed = (serviceComponent \ "CapacityUsed").validate[Long].map(l => l).getOrElse(0L)
                  val capacityRemaining = (serviceComponent \ "CapacityRemaining").validate[Long].map(l => l).getOrElse(0L)
                  val usedPercentage = (serviceComponent \ "PercentUsed").validate[Double].map(l => l).getOrElse(0.0)
                  val totalFiles = (serviceComponent \ "TotalFiles").validate[Long].map(l => l).getOrElse(0L)
                  val nameNodeInfo = NameNode(clusterName.get, ambari.host, ambari.dataCenter,startTime,capacityUsed,capacityRemaining,usedPercentage,totalFiles)
                  storage.updateNameNodeInfo(nameNodeInfo)
                }
              }
            }
          }
        }
      }.recoverWith{
        case e:Exception =>
          Logger.error("Exception while synchronizing Ambari",e)
          throw new DataPlaneError(e.getMessage)
      }
  }

  def getWs(api: String): WSRequest = {
    ws.url(s"${prefix}${api}").withAuth(ambari.credentials.userName,ambari.credentials.password,WSAuthScheme.BASIC).withHeaders("Content-Type" -> "application/json", "X-Requested-By" -> "ambari")
  }
}
