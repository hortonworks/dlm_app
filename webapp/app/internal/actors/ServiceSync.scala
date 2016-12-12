package internal.actors

import java.nio.charset.StandardCharsets
import java.util.Base64

import akka.actor.{Actor, ActorLogging, ActorRef}
import com.hw.dp.service.api.Poll
import com.hw.dp.service.cluster.{Ambari, Service, ServiceComponent}
import internal.DataPlaneError
import internal.persistence.{DataStorage, SaveService, SaveServiceComponent}
import play.api.libs.ws.{WSClient, WSRequest}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
class ServiceSync(val storage: DataStorage, ws: WSClient,dataPersister: ActorRef) extends Actor with ActorLogging {

  val componentApi = "components"

  override def receive: Receive = {
    // load each cluster and start fetching components
    // There may be an initial delay in loading data till
    // the clusters have been synced into the system

    case Poll() =>
      //look up all clusters for all synced registered Ambari's
      storage.loadClusterInfos().map { ambariClusters =>
        ambariClusters.map { ac =>
          val baseUrl = s"${ac.ambari.protocol}://${ac.ambari.host}:${ac.ambari.port}/api/v1/clusters"
          // for each Ambari cluster start fetching service info
          ac.clusters.map { cls =>
            cls.map { cl =>
              // get All service components
              val components = getWs(s"${baseUrl}/${cl.name}/", ac.ambari, componentApi).get()
              components.map { cResp =>
                val componentsList = (cResp.json \ "items" \\ "ServiceComponentInfo").map(_.validate[Map[String, String]].map(m => m).getOrElse(Map[String, String]()))
                componentsList.map { component =>
                  // for each component , hit the component URL and get the component information
                  // component URL is the component API url followed by component name
                  val componentResult = getWs(s"${baseUrl}/${cl.name}/", ac.ambari, s"${componentApi}/${component("component_name")}").get()

                  componentResult.map { compRes =>
                    val hosts = (compRes.json \ "host_components" \\ "HostRoles").map(_.validate[Map[String, String]].map(m => m).getOrElse(Map[String, String]()))
                    val state = (compRes.json \ "ServiceComponentInfo" \ "status").validate[String].map(s => s).getOrElse("STARTED")
                    val hostList = hosts.map(m => m("host_name"))
                    val componentToAdd = ServiceComponent(component("component_name"), component("service_name"), cl.name, cl.ambariHost,cl.dataCenter, state, hostList)
                    dataPersister ! SaveServiceComponent(componentToAdd)
                  }
                }
              }
            }
          }
        }
      }.recoverWith{
        case e:Exception => throw e
      }
  }

  def getWs(prefix: String, ambari: Ambari, api: String): WSRequest = {
    val creds: String = s"${ambari.credentials.userName}:${ambari.credentials.password}"
    ws.url(s"${prefix}${api}").withHeaders("Content-Type" -> "application/json", "X-Requested-By" -> "ambari",
      "Authorization" -> s"Basic ${Base64.getEncoder.encodeToString(creds.getBytes(StandardCharsets.UTF_8))}")
  }

}
