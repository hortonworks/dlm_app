package domain

import java.time.LocalDateTime
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{ClusterHealth, ClusterHost}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class ClusterHealthRepo @Inject()(
  protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

    import profile.api._

    val ClusterHealths = TableQuery[ClusterHealthTable]

    def allWithCluster(clusterId : Long): Future[Option[ClusterHealth]] = {
      db.run(ClusterHealths.filter( _.clusterId === clusterId).result.headOption)
    }

    def insert(clusterHost: ClusterHealth): Future[ClusterHealth] = {
      db.run {
        ClusterHealths returning ClusterHealths += clusterHost
      }
    }

    def findByClusterAndHealthId(clusterId: Long, hostId:Long): Future[Option[ClusterHealth]] = {
      db.run(ClusterHealths.filter( c => c.clusterId === clusterId && c.id === hostId).result.headOption)
    }

    def deleteById(clusterId:Long, id: Long): Future[Int] = {
      db.run(ClusterHealths.filter( c => (c.clusterId === clusterId && c.id === id)).delete)
    }


    final class ClusterHealthTable(tag: Tag) extends Table[ClusterHealth](tag, Some("dataplane"), "dp_cluster_health") {

      def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

      def status = column[String]("status")

      def state = column[String]("state")

      def uptime = column[Option[Long]]("uptime")

      def started = column[Option[LocalDateTime]]("started")

      def clusterId = column[Long]("clusterid")

      def * = (id, status, state, uptime, started, clusterId)<> ((ClusterHealth.apply _).tupled, ClusterHealth.unapply)
    }

  }
