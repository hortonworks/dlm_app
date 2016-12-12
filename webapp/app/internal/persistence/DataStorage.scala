package internal.persistence

import com.hw.dp.service.cluster._
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future


trait DataStorage {

  def saveMetrics(metric: ClusterMetric): Future[WriteResult]

  def updateNameNodeInfo(nameNodeInfo: NameNode) : Future[WriteResult]

  def addComponent(componentToAdd: ServiceComponent): Future[WriteResult]

  def loadClusterInfos(): Future[Seq[AmbariClusters]]

  def updateAllHosts(hosts: Host): Future[WriteResult]

  def createOrUpdateCluster(cluster: Cluster): Future[WriteResult]

  def loadAmbari(): Future[Seq[Ambari]]

}
