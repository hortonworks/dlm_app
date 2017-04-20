package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.ClusterService
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class ClusterServiceRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Services = TableQuery[ClusterServiceTable]

  def all(): Future[List[ClusterService]] = db.run {
    Services.to[List].result
  }


  def allWithCluster(clusterId: Long) = {
    db.run(Services.filter(_.clusterid === clusterId).to[List].result)
  }

  def allWithDatalake(datalakeId: Long) = {
    db.run(Services.filter(_.datalakeid === datalakeId).to[List].result)
  }

  def findByNameAndCluster(serviceName: String, clusterId: Long) =  {
    db.run(Services.filter(_.servicename === serviceName).filter(_.clusterid === clusterId).result.headOption)
  }

  def findByServiceName(serviceName: String) =  {
    db.run(Services.filter(_.servicename === serviceName).to[List].result)
  }

  def findByIdAndDatalake(serviceId: Long, datalakeId: Long) = {
    db.run(Services.filter(_.id === serviceId).filter(_.datalakeid === datalakeId).result.headOption)
  }


  def findByIdAndCluster(serviceId: Long, clusterId: Long) = {
    db.run(Services.filter(_.id === serviceId).filter(_.clusterid === clusterId).result.headOption)
  }


  def insert(cluster: ClusterService): Future[ClusterService] = {
    db.run {
      Services returning Services += cluster
    }
  }

  def updateByName(cs: ClusterService):Future[Int] = {
    db.run(Services.filter(_.servicename === cs.servicename).filter(_.clusterid === cs.clusterid)
      .map(r => (r.fullURL,r.servicehost,r.serviceport,r.properties))
        .update(cs.fullURL,cs.servicehost,cs.serviceport,cs.properties)).map( r => r)
  }

  def findById(clusterId: Long): Future[Option[ClusterService]] = {
    db.run(Services.filter(_.id === clusterId).result.headOption)
  }

  def deleteById(clusterId: Long): Future[Int] = {
    db.run(Services.filter(_.id === clusterId).delete)
  }

  final class ClusterServiceTable(tag: Tag)
      extends Table[ClusterService](tag,
                                    Some("dataplane"),
                                    "dp_cluster_services") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def servicename = column[String]("servicename")

    def servicehost = column[Option[String]]("servicehost")

    def serviceport = column[Option[Int]]("serviceport")

    def fullURL = column[Option[String]]("fullurl")

    def datalakeid = column[Option[Long]]("datalakeid")

    def clusterid = column[Option[Long]]("clusterid")

    def properties = column[Option[JsValue]]("properties")

    def * =
      (id,
       servicename,
       servicehost,
       serviceport,
       fullURL,
       properties,
       clusterid,
       datalakeid) <> ((ClusterService.apply _).tupled, ClusterService.unapply)

  }

}
