package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.ClusterProperties
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class ClusterPropertiesRepo @Inject()(
  protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

    import profile.api._

    val ClusterProps= TableQuery[ClusterPropertiesTable]

    def allWithCluster(clusterId : Long): Future[List[ClusterProperties]] = db.run {
      ClusterProps.filter( _.clusterId === clusterId).to[List].result
    }

    def insert(clusterHost: ClusterProperties): Future[ClusterProperties] = {
      db.run {
        ClusterProps returning ClusterProps += clusterHost
      }
    }

    def findByClusterAndPropertiesId(clusterId: Long, hostId:Long): Future[Option[ClusterProperties]] = {
      db.run(ClusterProps.filter( c => c.clusterId === clusterId && c.id === hostId).result.headOption)
    }

    def deleteById(clusterId:Long, id: Long): Future[Int] = {
      db.run(ClusterProps.filter( c => (c.clusterId === clusterId && c.id === id)).delete)
    }

    final class ClusterPropertiesTable(tag: Tag) extends Table[ClusterProperties](tag, Some("dataplane"), "dp_cluster_properties") {

      def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

      def properties = column[Option[JsValue]]("properties")

      def clusterId = column[Long]("clusterid")

      def * = (id, properties, clusterId)<> ((ClusterProperties.apply _).tupled, ClusterProperties.unapply)
    }

  }
