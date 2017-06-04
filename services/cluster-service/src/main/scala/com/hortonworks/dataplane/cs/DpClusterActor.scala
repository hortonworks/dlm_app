package com.hortonworks.dataplane.cs

import akka.actor.{Actor, ActorLogging, ActorRef, PoisonPill, Props}
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster}
import com.hortonworks.dataplane.commons.service.api.Poll
import com.typesafe.config.Config
import play.api.libs.json.JsValue
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

private[dataplane] case class GetClusters(clusters: Seq[Cluster])
private[dataplane] case class AddedClusters(clusters: Seq[Cluster])
private[dataplane] case class StoredClusters(clusters: Seq[Cluster])

class DpClusterActor(private val dpCluster: DataplaneCluster,
                     private val credentials: Credentials,
                     private val config: Config,
                     private val storageInterface: StorageInterface,
                     private val wSClient: WSClient,
                     private val dbActor: ActorRef)
    extends Actor
    with ActorLogging {

  val clusterMap = collection.mutable.Map[Long, ActorRef]()
  val dpClusterInterface =
    AmbariDataplaneClusterInterfaceImpl(dpCluster, wSClient, config, credentials)

  val prefix = Try(config.getString("dp.service.ambari.cluster.api.prefix"))
    .getOrElse("/api/v1/clusters")

  import akka.pattern.pipe

  def extractSecurity(props: Option[JsValue]) = {
    props.map { json =>
      (json \ "security_type")
        .validate[String]
        .map { s =>
          s.toLowerCase == "kerberos"
        }
        .getOrElse(false)
    }
  }

  def makeCluster(cname: String) = {

    dpClusterInterface.getClusterDetails(cname).map { props =>
      Cluster(
        name = cname,
        description = s"Cluster $cname",
        clusterUrl = Some(s"${dpCluster.ambariUrl}$prefix/$cname"),
        secured = extractSecurity(props),
        properties = props,
        dataplaneClusterId = dpCluster.id,
        userid = dpCluster.createdBy
      )
    }
  }

  override def receive = {
    case Poll() =>
      // Pull cluster related information from linked Ambari
      val fClusters = dpClusterInterface.discoverClusters
      // Register all clusters in storage

      val clustersToCreate =
        fClusters.map(clusters => clusters.map(c => makeCluster(c)))
      val fm = clustersToCreate.flatMap { cc =>
        Future.sequence(cc)
      }
      fm.map(GetClusters).pipeTo(self)

    case GetClusters(clusters) =>
      storageInterface.addClusters(clusters).map(AddedClusters).pipeTo(self)

    case AddedClusters(clusters) =>
      log.info(s"Starting sync for datalake ${dpCluster.name}")
      storageInterface
        .getLinkedClusters(dpCluster)
        .map(StoredClusters)
        .pipeTo(self)

    case StoredClusters(clusters) =>
      val current = collection.mutable.Set[Long]()
      clusters.foreach { c =>
        current += c.id.get
        clusterMap.getOrElseUpdate(c.id.get,
                                   context.actorOf(Props(classOf[ClusterActor],
                                                         c,
                                                         dpCluster,
                                                         wSClient,
                                                         storageInterface,
                                                         credentials,
                                                         dbActor,
                                                         config),
                                                   s"Cluster_${c.id.get}"))
      }
      val toClear = clusterMap.keySet -- current
      log.info(s"cleaning up workers for clusters $toClear")
      toClear.foreach { tc =>
        clusterMap.get(tc).map(c => c ! PoisonPill)
        clusterMap.remove(tc)
      }
      current.clear

      clusterMap.values.foreach(_ ! Poll())

    case ServiceSaved(clusterData, cluster) =>
      log.info(s"Cluster state saved for - ${clusterData.servicename}")
      clusterMap(cluster.id.get) ! ServiceSaved(clusterData, cluster)

    case HostInfoSaved(cluster) =>
      clusterMap(cluster.id.get) ! HostInfoSaved(cluster)

  }
}
