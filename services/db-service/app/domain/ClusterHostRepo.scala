package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.ClusterHost
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class ClusterHostRepo @Inject()(
  protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val ClusterHosts = TableQuery[ClusterHostTable]

  def allWithCluster(clusterId : Long): Future[List[ClusterHost]] = db.run {
    ClusterHosts.filter( _.clusterId === clusterId).to[List].result
  }

  def insert(clusterHost: ClusterHost): Future[ClusterHost] = {
    db.run {
      ClusterHosts returning ClusterHosts += clusterHost
    }
  }

  def findByClusterAndHostId(clusterId: Long, hostId:Long): Future[Option[ClusterHost]] = {
    db.run(ClusterHosts.filter( c => c.clusterId === clusterId && c.id === hostId).result.headOption)
  }

  def deleteById(clusterId:Long, id: Long): Future[Int] = {
    db.run(ClusterHosts.filter( c => (c.clusterId === clusterId && c.id === id)).delete)
  }

  final class ClusterHostTable(tag: Tag) extends Table[ClusterHost](tag, Some("dataplane"), "dp_cluster_hosts") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def host = column[String]("host")

    def status = column[String]("status")

    def properties = column[Option[JsValue]]("properties")

    def clusterId = column[Long]("clusterid")

    def * = (id, host, status, properties, clusterId)<> ((ClusterHost.apply _).tupled, ClusterHost.unapply)
  }

}