package internal.persistence

import com.hortonworks.dataplane.commons.service.cluster._
import models.{BackupPolicy, DataCenterDetail}
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future


trait ClusterDataStorage {

  def loadCluster(clusterHost: String, datacenter: String) : Future[Option[Ambari]]

  def loadClusterInformation(clusterHost: String, datacenter: String):Future[Option[Cluster]]

  def loadDataCenterInfo(datacenter: String): Future[DataCenterDetail]

  def saveMetrics(metric: ClusterMetric): Future[WriteResult]

  def updateNameNodeInfo(nameNodeInfo: NameNode) : Future[WriteResult]

  def addComponent(componentToAdd: ServiceComponent): Future[WriteResult]

  def loadClusterInfos(): Future[Seq[AmbariClusters]]

  def updateAllHosts(hosts: Host): Future[WriteResult]

  def createOrUpdateCluster(cluster: Cluster): Future[WriteResult]

  def loadAmbari(): Future[Seq[Ambari]]

  def getBackupPolicyById(id: String): Future[Option[BackupPolicy]]

  def getDataCenterById(id: String): Future[Option[DataCenter]]

  def getClusterById(id: String): Future[Option[Ambari]]

  def getClustersByDataCenterId(id: String): Future[Seq[Ambari]]
}
