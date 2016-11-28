package internal.persistence

import com.hw.dp.service.cluster._
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future


trait DataStorage {

  def addComponent(componentToAdd: ServiceComponent): Future[Option[WriteResult]]

  def loadClusterInfos(): Future[Seq[AmbariClusters]]

  def createOrUpdateHost(hosts: Host): Future[WriteResult]

  def createOrUpdateCluster(cluster: Cluster): Future[WriteResult]

  def loadAmbari(): Future[Seq[Ambari]]

  def loadServices: Seq[Service]

  def loadService(service: Service): Option[Service]

  def addService(service: Service): Future[Option[WriteResult]]

  def removeService(service: Service): Boolean

}
