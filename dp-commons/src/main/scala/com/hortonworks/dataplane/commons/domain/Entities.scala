package com.hortonworks.dataplane.commons.domain

import java.time.LocalDateTime

import play.api.libs.json.{JsValue, Json}

object Entities {

  // Pagination
  case class Pagination(page: Int, offset: Long, limit: Long)

  case class User(id: Option[Long] = None,
                  username: String,
                  password: String,
                  active: Option[Boolean] = Some(true),
                  created: Option[LocalDateTime] = Some(LocalDateTime.now()),
                  updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

  case class Role(id: Option[Long] = None,
                  roleName: String,
                  created: Option[LocalDateTime] = Some(LocalDateTime.now()),
                  updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

  case class Permission(
      id: Option[Long] = None,
      permission: String,
      roleId: Option[Long],
      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
      updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

  case class UserRole(id: Option[Long] = None,
                      userId: Option[Long],
                      roleId: Option[Long])

  case class UserRoles(username: String, roles: Seq[String])
  case class RolePermission(role: String, permissions: Seq[String])
  case class UserPermission(username: String, rights: Seq[RolePermission])

  //Data lake
  case class Location(id: Option[Long] = None, country: String, city: String)

  case class Datalake(
      id: Option[Long] = None,
      name: String,
      description: String,
      location: Option[Long],
      createdBy: Option[Long],
      properties: Option[JsValue],
      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
      updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

  case class Category(
      id: Option[Long] = None,
      name: String,
      description: String,
      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
      updated: Option[LocalDateTime] = Some(LocalDateTime.now())
  )

  case class Cluster(
      id: Option[Long] = None,
      name: String,
      description: String,
      fqdn: Option[String] = None,
      ipaddr: Option[String] = None,
      port: Option[Int] = None,
      ambariuser: Option[String] = None,
      ambaripass: Option[String] = None,
      secured: Option[Boolean] = Some(false),
      kerberosuser: Option[String] = None,
      kerberosticketLocation: Option[String] = None,
      datalakeid: Option[Long] = None,
      userid: Option[Long] = None,
      properties: Option[JsValue] = None
  )

  case class CloudCluster(
      id: Option[Long] = None,
      name: String,
      description: String,
      fqdn: Option[String] = None,
      ipaddr: Option[String] = None,
      port: Option[Int] = None,
      ambariuser: Option[String] = None,
      ambaripass: Option[String] = None,
      datalakeid: Option[Long] = None,
      userid: Option[Long] = None,
      properties: Option[JsValue] = None
  )

  case class ClusterService(
      id: Option[Long] = None,
      servicename: String,
      servicehost: String,
      serviceport: Int,
      fullURL: Option[String] = None,
      properties: Option[JsValue] = None,
      clusterid: Option[Long] = None,
      datalakeid: Option[Long] = None
  )

  case class EnabledSku(
      skuId: Long,
      enabledBy: Long,
      enabledOn: Option[LocalDateTime] = Some(LocalDateTime.now()),
      smartSenseId: String,
      subscriptionId: String,
      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
      updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

  case class Sku(id: Option[Long] = None,
                 name: String,
                 description: String,
                 status: Option[Short] = Some(0),
                 created: Option[LocalDateTime] = Some(LocalDateTime.now()),
                 updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

}

object JsonFormatters {
  import com.hortonworks.dataplane.commons.domain.Entities._

  implicit val userWrites = Json.writes[User]
  implicit val userReads = Json.reads[User]

  implicit val roleWrites = Json.writes[Role]
  implicit val roleReads = Json.reads[Role]

  implicit val userRoleWrites = Json.writes[UserRole]
  implicit val userRoleReads = Json.reads[UserRole]

  implicit val userRolesWrites = Json.writes[UserRoles]
  implicit val rolePermissionWrites = Json.writes[RolePermission]
  implicit val userPermissionWrites = Json.writes[UserPermission]

  implicit val permissionWrites = Json.writes[Permission]
  implicit val permissionReads = Json.reads[Permission]

  implicit val categoryWrites = Json.writes[Category]
  implicit val categoryReads = Json.reads[Category]

  implicit val locationWrites = Json.writes[Location]
  implicit val locationReads = Json.reads[Location]
  implicit val dataLakeWrites = Json.writes[Datalake]
  implicit val dataLakeReads = Json.reads[Datalake]

  implicit val skuWrites = Json.writes[Sku]
  implicit val skuReads = Json.reads[Sku]
  implicit val enabledSkuWrites = Json.writes[EnabledSku]
  implicit val enabledSkuReads = Json.reads[EnabledSku]

  implicit val clusterWrites = Json.writes[Cluster]
  implicit val clusterReads = Json.reads[Cluster]

  implicit val clusterServiceWrites = Json.writes[ClusterService]
  implicit val clusterServiceReads = Json.reads[ClusterService]



  implicit val couldClusterWrites = Json.writes[CloudCluster]
  implicit val couldClusterReads = Json.reads[CloudCluster]
}
