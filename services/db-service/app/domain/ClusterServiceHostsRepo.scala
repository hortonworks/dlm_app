package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService, ClusterServiceHost}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class ClusterServiceHostsRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider,
    private val csr: ClusterServiceRepo)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Hosts = TableQuery[ClusterServiceHostsTable]

  def allByClusterAndService(
      clusterId: Long,
      serviceId: Long): Future[List[ClusterServiceHost]] = {
    val query = for {
      services <- csr.Services if services.clusterid === clusterId
      endpoints <- Hosts if endpoints.serviceid === serviceId
      if endpoints.serviceid === services.id
    } yield (endpoints)

    db.run(query.to[List].result)
  }

  def allByServiceName(serviceName: String): Future[List[(ClusterService, ClusterServiceHost)]] = {
    val query = for {
      (service, endpoint) <- csr.Services.filter(_.servicename === serviceName) join Hosts on(_.id === _.serviceid)
    } yield (service, endpoint)
    db.run(query.to[List].result)
  }

  def allByService(serviceId: Long): Future[Option[(ClusterService, ClusterServiceHost)]] = {
    val query = for {
      (service, endpoint) <- csr.Services.filter(_.id === serviceId) join Hosts on(_.id === _.serviceid)
    } yield (service, endpoint)
    db.run(query.to[List].result.headOption)
  }

  def insert(endPoint: ClusterServiceHost): Future[ClusterServiceHost] = {
    db.run {
      Hosts returning Hosts += endPoint
    }
  }

  def updateOrInsert(host: ClusterServiceHost): Future[Boolean] = {
    db.run(
        Hosts
          .filter(r => r.serviceid === host.serviceid)
          .map(o => o.host)
          .update(host.host))
      .map {
        case 0 =>
          db.run(Hosts += host)
          true
        case 1 => true
        case n => throw new Exception(s"Too many rows updated for $host")
      }
  }

  def findById(hostId: Long): Future[Option[ClusterServiceHost]] = {
    db.run(Hosts.filter(_.id === hostId).result.headOption)
  }

  def deleteById(hostId: Long): Future[Int] = {
    db.run(Hosts.filter(_.id === hostId).delete)
  }

  final class ClusterServiceHostsTable(tag: Tag)
      extends Table[ClusterServiceHost](tag,
                                        Some("dataplane"),
                                        "dp_cluster_service_hosts") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def host = column[String]("host")

    def serviceid = column[Option[Long]]("serviceid")

    def * =
      (id, host, serviceid) <> ((ClusterServiceHost.apply _).tupled, ClusterServiceHost.unapply)

  }

}
