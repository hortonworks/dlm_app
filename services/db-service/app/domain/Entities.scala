package domain

import java.time.LocalDateTime

import play.api.libs.json.{JsValue, Json}

object Entities {

  // Pagination
  case class Pagination(page: Int, offset: Long, limit: Long)

  case class User(id:Option[Long] = None,username: String,
                  password: String,
                  active: Option[Boolean] = Some(true),
                  created:Option[LocalDateTime] = Some(LocalDateTime.now()),
                  updated:Option[LocalDateTime] = Some(LocalDateTime.now()))



  case class Role(id:Option[Long] = None,roleName: String,
                  created: Option[LocalDateTime] = Some(LocalDateTime.now()),
                  updated: Option[LocalDateTime] = Some(LocalDateTime.now()))


  case class UserRole(id:Option[Long] = None,userId:Option[Long],roleId:Option[Long])

  case class UserRoles(username:String,roles:Seq[String])

  //Data lake
  case class Location(id:Option[Long] = None,country: String, city: String)

  case class Datalake(id:Option[Long] = None,name: String,
                      description: String,
                      location: Option[Long],
                      createdBy: Option[Long],
                      properties: Option[JsValue],
                      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
                      updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

}

object JsonFormatters {

  import domain.Entities._
  implicit val userWrites = Json.writes[User]
  implicit val userReads = Json.reads[User]



  implicit val roleWrites = Json.writes[Role]
  implicit val roleReads = Json.reads[Role]

  implicit val userRoleWrites = Json.writes[UserRole]
  implicit val userRoleReads = Json.reads[UserRole]

  implicit val userRolesWrites = Json.writes[UserRoles]



  implicit val locationWrites = Json.writes[Location]
  implicit val locationReads = Json.reads[Location]
  implicit val dataLakeWrites = Json.writes[Datalake]
  implicit val dataLakeReads = Json.reads[Datalake]

}
