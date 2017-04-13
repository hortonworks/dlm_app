package domain

import java.time.LocalDateTime
import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.{Datalake, Location}
import play.api.db.slick.DatabaseConfigProvider
import play.api.libs.json.JsValue

import scala.concurrent.Future

class DataLakeRepo @Inject()(
    private val userRepo: UserRepo,
    protected val dbConfigProvider: DatabaseConfigProvider) {

  val dbConfig = dbConfigProvider.get[DpPgProfile]

  val db = dbConfig.db

  import dbConfig.profile.api._

  private val Locations = TableQuery[LocationsTable]
  private val Datalakes = TableQuery[DataLakesTable]

  def getLocation(id: Long): Future[Option[Location]] = {
    db.run(Locations.filter(_.id === id).result.headOption)
  }

  def deleteLocation(id: Long): Future[Int] = {
    val location = db.run(Locations.filter(_.id === id).delete)
    location
  }
  def all(): Future[List[Datalake]] = db.run {
    Datalakes.to[List].result
  }


  def findById(datalakeId: Long): Future[Option[Datalake]] = {
    db.run(Datalakes.filter(_.id === datalakeId).result.headOption)
  }

  def deleteById(datalakeId: Long): Future[Int] = {
    db.run(Datalakes.filter(_.id === datalakeId).delete)
  }

  def insert(datalake: Datalake): Future[Datalake] = db.run {
    Datalakes returning Datalakes += datalake
  }

  def addLocation(location: Location): Future[Location] = db.run {
    Locations returning Locations += location
  }

  def getLocations(query: Option[String]): Future[List[Location]] = db.run {
    query match {
      case Some(query) => Locations.filter(_.city.toLowerCase.startsWith(query.toLowerCase)).take(20).to[List].result
      case None => Locations.to[List].result
    }
  }

  private class LocationsTable(tag: Tag)
      extends Table[Location](tag, Some("dataplane"), "dp_locations") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def country = column[String]("country")

    def city = column[String]("city")

    def latitude = column[Float]("latitude")

    def longitude = column[Float]("longitude")

    def * =
      (id, country, city, latitude, longitude) <> ((Location.apply _).tupled, Location.unapply)
  }

  private class DataLakesTable(tag: Tag)
      extends Table[Datalake](tag, Some("dataplane"), "dp_datalakes") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[String]("description")

    def ambariUrl = column[String]("ambariurl")

    def locationId = column[Option[Long]]("locationid")

    def userId = column[Option[Long]]("createdby")

    def created = column[Option[LocalDateTime]]("created")

    def updated = column[Option[LocalDateTime]]("updated")

    def properties = column[Option[JsValue]]("properties")

    def state = column[Option[String]]("state")

    def location = foreignKey("location", locationId, Locations)(_.id)

    def createdBy = foreignKey("user", userId, userRepo.Users)(_.id)

    def * =
      (id, name, description,ambariUrl, locationId, userId, properties,state, created, updated) <> ((Datalake.apply _).tupled, Datalake.unapply)
  }

}
