package domain

import java.time.LocalDateTime
import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneCluster, Location}
import play.api.db.slick.DatabaseConfigProvider
import play.api.libs.json.JsValue
import slick.jdbc.GetResult

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DpClusterRepo @Inject()(
    protected val userRepo: UserRepo,
    protected val dbConfigProvider: DatabaseConfigProvider) {

  val dbConfig = dbConfigProvider.get[DpPgProfile]

  val db = dbConfig.db

  import dbConfig.profile.api._

  val Locations = TableQuery[LocationsTable]
  val DataplaneClusters = TableQuery[DpClustersTable]

  def getLocation(id: Long): Future[Option[Location]] = {
    db.run(Locations.filter(_.id === id).result.headOption)
  }

  def deleteLocation(id: Long): Future[Int] = {
    val location = db.run(Locations.filter(_.id === id).delete)
    location
  }
  def all(): Future[List[DataplaneCluster]] = db.run {
    DataplaneClusters.to[List].result
  }

  def findById(dpClusterId: Long): Future[Option[DataplaneCluster]] = {
    db.run(DataplaneClusters.filter(_.id === dpClusterId).result.headOption)
  }

  def deleteById(dpClusterId: Long): Future[Int] = {
    db.run(DataplaneClusters.filter(_.id === dpClusterId).delete)
  }

  def insert(dpCluster: DataplaneCluster): Future[DataplaneCluster] = {
    def trimTrailingSlash = {
      if (dpCluster.ambariUrl.endsWith("/"))
        dpCluster.ambariUrl.stripSuffix("/")
      else dpCluster.ambariUrl
    }

    val dataplaneCluster = dpCluster.copy(
      isDatalake = dpCluster.isDatalake.map(Some(_)).getOrElse(Some(false)),
      ambariUrl = trimTrailingSlash
    )
    db.run {
      DataplaneClusters returning DataplaneClusters += dataplaneCluster
    }
  }

  def addLocation(location: Location): Future[Location] = db.run {
    Locations returning Locations += location
  }

  def updateStatus(dpCluster: DataplaneCluster): Future[Int] = {
    db.run(
        DataplaneClusters
          .filter(_.id === dpCluster.id)
          .map(r => (r.state, r.updated))
          .update(dpCluster.state, Some(LocalDateTime.now())))
      .map(r => r)
  }

  private def getLocationsByQuery(query: String): Future[List[Location]] = {
    implicit val getLocationResult = GetResult(r => Location(
      r.nextLongOption,
      r.nextString,
      r.nextString,
      r.nextFloat,
      r.nextFloat)
    )
    db.run(
      sql"""select  l.id, l.country, l.city, l.latitude, l.longitude
            from dataplane.locations as l
            where lower(l.city) || ', ' || lower(l.country) like ${query.toLowerCase} || '%'
            limit 20""".as[Location]
    ).map(v => v.toList)
  }

  private def  getAllLocations(): Future[List[Location]] = db.run {
    Locations.to[List].result
  }

  def getLocations(query: Option[String]): Future[List[Location]] =
    query match {
      case Some(query) => getLocationsByQuery(query)
      case None => getAllLocations()
    }

  final class LocationsTable(tag: Tag)
      extends Table[Location](tag, Some("dataplane"), "locations") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def country = column[String]("country")

    def city = column[String]("city")

    def latitude = column[Float]("latitude")

    def longitude = column[Float]("longitude")

    def * =
      (id, country, city, latitude, longitude) <> ((Location.apply _).tupled, Location.unapply)
  }

  final class DpClustersTable(tag: Tag)
      extends Table[DataplaneCluster](tag, Some("dataplane"), "dp_clusters") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def dcName = column[String]("dc_name")

    def description = column[String]("description")

    def ambariUrl = column[String]("ambari_url")

    def locationId = column[Option[Long]]("location_id")

    def userId = column[Option[Long]]("created_by")

    def created = column[Option[LocalDateTime]]("created")

    def updated = column[Option[LocalDateTime]]("updated")

    def properties = column[Option[JsValue]]("properties")

    def state = column[Option[String]]("state")

    def isDataLake = column[Option[Boolean]]("is_datalake")

    def knoxEnabled = column[Option[Boolean]]("knox_enabled")

    def knoxUrl = column[Option[String]]("knox_url")

    def location = foreignKey("location", locationId, Locations)(_.id)

    def createdBy = foreignKey("user", userId, userRepo.Users)(_.id)

    def * =
      (id,
       name,
       dcName,
       description,
       ambariUrl,
       locationId,
       userId,
       properties,
       state,
       isDataLake,
       knoxEnabled,
       knoxUrl,
       created,
       updated) <> ((DataplaneCluster.apply _).tupled, DataplaneCluster.unapply)
  }

}
