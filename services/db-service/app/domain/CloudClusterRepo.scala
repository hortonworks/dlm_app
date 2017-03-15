package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.CloudCluster
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class CloudClusterRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Clusters = TableQuery[CloudClustersTable]

  def all(): Future[List[CloudCluster]] = db.run {
    Clusters.to[List].result
  }

  def insert(cluster: CloudCluster): Future[CloudCluster] = {
    db.run {
      Clusters returning Clusters += cluster
    }
  }

  def findById(clusterId: Long): Future[Option[CloudCluster]] = {
    db.run(Clusters.filter(_.id === clusterId).result.headOption)
  }

  def deleteById(clusterId: Long): Future[Int] = {
    db.run(Clusters.filter(_.id === clusterId).delete)
  }

  final class CloudClustersTable(tag: Tag)
      extends Table[CloudCluster](tag, Some("dataplane"), "dp_cloud_clusters") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[String]("description")

    def fqdn = column[Option[String]]("fqdn")

    def ipaddr = column[Option[String]]("ipaddr")

    def port = column[Option[Int]]("port")

    def ambariuser = column[Option[String]]("ambariuser")

    def ambaripass = column[Option[String]]("ambaripass")

    def datalakeid = column[Option[Long]]("datalakeid")

    def userid = column[Option[Long]]("userid")

    def properties = column[Option[JsValue]]("properties")

    def * =
      (id,
       name,
       description,
       fqdn,
       ipaddr,
       port,
       ambariuser,
       ambaripass,
       datalakeid,
       userid,
       properties) <> ((CloudCluster.apply _).tupled, CloudCluster.unapply)

  }

}
