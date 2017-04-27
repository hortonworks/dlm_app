package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.ClusterServiceEndpoint
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class ClusterServiceEndpointRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider,private val csr: ClusterServiceRepo)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Endpoints = TableQuery[ClusterServiceEndpointTable]

  def allByClusterAndService(clusterId:Long,serviceId: Long): Future[List[ClusterServiceEndpoint]] = {
    val query = for {
      services <- csr.Services if services.clusterid === clusterId
      endpoints <- Endpoints if endpoints.serviceid === serviceId if endpoints.serviceid === services.id
    } yield (endpoints)

    db.run(query.to[List].result)
  }



  def insert(endPoint: ClusterServiceEndpoint): Future[ClusterServiceEndpoint] = {
    db.run {
      Endpoints returning Endpoints += endPoint
    }
  }


  def findById(endpointId: Long): Future[Option[ClusterServiceEndpoint]] = {
    db.run(Endpoints.filter(_.id === endpointId).result.headOption)
  }

  def deleteById(endPointId: Long): Future[Int] = {
    db.run(Endpoints.filter(_.id === endPointId).delete)
  }

  final class ClusterServiceEndpointTable(tag: Tag)
      extends Table[ClusterServiceEndpoint](tag,
                                    Some("dataplane"),
                                    "dp_cluster_service_endpoint") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def protocol = column[String]("protocol")

    def host = column[String]("host")

    def port = column[Option[Int]]("port")

    def pathsegment = column[Option[String]]("pathsegment")

    def serviceid = column[Option[Long]]("serviceid")

    def * =
      (id,
       name,
       protocol,
       host,
       port,pathsegment,serviceid) <> ((ClusterServiceEndpoint.apply _).tupled, ClusterServiceEndpoint.unapply)

  }

}
