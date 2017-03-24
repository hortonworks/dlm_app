package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class ClusterRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Clusters = TableQuery[ClustersTable]

  def all(datalakeIdOption: Option[String], userIdOption: Option[String]): Future[List[Cluster]] = db.run {
    Clusters.to[List].result
  }

  def insert(cluster: Cluster): Future[Cluster] = {
    db.run {
      Clusters returning Clusters += cluster
    }
  }

  def findById(clusterId: Long): Future[Option[Cluster]] = {
    db.run(Clusters.filter(_.id === clusterId).result.headOption)
  }

  def deleteById(clusterId: Long): Future[Int] = {
    db.run(Clusters.filter(_.id === clusterId).delete)
  }

  final class ClustersTable(tag: Tag)
      extends Table[Cluster](tag, Some("dataplane"), "dp_clusters") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[String]("description")

    def ambariurl = column[Option[String]]("ambariurl")

    def ambariuser = column[Option[String]]("ambariuser")

    def ambaripass = column[Option[String]]("ambaripass")

    def secured = column[Option[Boolean]]("secured")

    def kerberosuser = column[Option[String]]("kerberosuser")

    def kerberosticketLocation =
      column[Option[String]]("kerberosticketlocation")

    def datalakeid = column[Option[Long]]("datalakeid")

    def userid = column[Option[Long]]("userid")

    def properties = column[Option[JsValue]]("properties")

    def * =
      (id,
       name,
       description,
       ambariurl,
       ambariuser,
       ambaripass,
       secured,
       kerberosuser,
       kerberosticketLocation,
       datalakeid,
       userid,
       properties) <> ((Cluster.apply _).tupled, Cluster.unapply)

  }

}
