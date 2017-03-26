package internal.persistence

import com.google.inject.{Inject, Singleton}
import com.hortonworks.dataplane.commons.service.cluster._
import models.{BackupPolicy, DataCenterDetail}
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

@Singleton
class MongoClusterDataStorage @Inject()(configuration: play.api.Configuration) extends ClusterDataStorage {

  def getConfig(key: String): String = {
    configuration.underlying.getString(key)
  }

  override def loadAmbari(): Future[Seq[Ambari]] = ???

  override def createOrUpdateCluster(cluster: Cluster): Future[WriteResult] = ???

  override def updateAllHosts(host: Host): Future[WriteResult] = ???

  override def loadClusterInfos(): Future[Seq[AmbariClusters]] = ???

  override def addComponent(component: ServiceComponent): Future[WriteResult] = ???

  override def updateNameNodeInfo(nameNodeInfo: NameNode): Future[WriteResult] = ???

  override def saveMetrics(metric: ClusterMetric): Future[WriteResult] = ???

  private def getAllNodesHealth(clusters: List[Ambari],datacenter:String): Future[Seq[Host]] = ???

  private def getNameNodeStats(clusters: List[Ambari],datacenter:String) = ???

  private def getLoadAverage(clusters: List[Ambari],datacenter:String) = ???

  override def loadDataCenterInfo(datacenter: String): Future[DataCenterDetail] = ???


  override def loadCluster(clusterHost: String, datacenter: String): Future[Option[Ambari]] = ???

  override def loadClusterInformation(clusterHost: String, datacenter: String): Future[Option[Cluster]] = ???

  override def getDataCenterById(id: String): Future[Option[DataCenter]] = ???

  override def getClusterById(id: String): Future[Option[Ambari]] = ???

  override def getClustersByDataCenterId(id: String): Future[Seq[Ambari]] = ???

  override def getBackupPolicyById(id: String): Future[Option[BackupPolicy]] = ???
}
