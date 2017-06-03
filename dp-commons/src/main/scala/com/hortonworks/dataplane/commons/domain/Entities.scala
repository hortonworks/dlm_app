package com.hortonworks.dataplane.commons.domain

import java.time.LocalDateTime

import play.api.libs.json.{JsValue, Json}

/**
  * Data plane main domain entities
  * add objects here which should be persisted
  */
object Entities {

  case class Error(code: String, message: String)
  case class Errors(errors: Seq[Error] = Seq()) {
    def combine(newErrors: Errors) = Errors(errors ++ newErrors.errors)
  }

  // Pagination
  case class Pagination(page: Int, offset: Long, limit: Long)

  case class User(id: Option[Long] = None,
                  username: String,
                  password: String,
                  displayname: String,
                  avatar: Option[String],
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
  case class Location(
      id: Option[Long] = None,
      country: String,
      city: String,
      latitude: Float,
      longitude: Float
  )

  case class DataplaneCluster(
      id: Option[Long] = None,
      name: String,
      description: String,
      ambariUrl: String,
      location: Option[Long],
      createdBy: Option[Long],
      properties: Option[JsValue],
      // state should be used to figure out the status of the cluster
      state: Option[String] = Some("TO_SYNC"),
      isDatalake: Option[Boolean] = Some(false),
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
      clusterUrl: Option[String] = None,
      secured: Option[Boolean] = Some(false),
      kerberosuser: Option[String] = None,
      kerberosticketLocation: Option[String] = None,
      dataplaneClusterId: Option[Long] = None,
      userid: Option[Long] = None,
      datacenter: Option[String] = None,
      properties: Option[JsValue] = None
  )

  case class ClusterService(
      id: Option[Long] = None,
      servicename: String,
      properties: Option[JsValue] = None,
      clusterId: Option[Long] = None,
      dpClusterId: Option[Long] = None
  )

  case class ClusterServiceHost(
      id: Option[Long] = None,
      host: String,
      serviceid: Option[Long] = None
  )

  case class Workspace(
      id: Option[Long] = None,
      name: String,
      description: String,
      createdBy: Long,
      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
      updated: Option[LocalDateTime] = Some(LocalDateTime.now())
  )

  case class AssetWorkspace(
      assetType: String,
      assetId: Long,
      workspaceId: Long
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

  case class ClusterHost(id: Option[Long] = None,
                         host: String,
                         ipaddr: String,
                         status: String,
                         properties: Option[JsValue] = None,
                         clusterId: Long)

  case class ClusterProperties(id: Option[Long] = None,
                               properties: Option[JsValue] = None,
                               clusterId: Long)

  case class Dataset(id: Option[Long] = None,
                     name: String,
                     description: Option[String],
                     dpClusterId: Long,
                     createdBy: Long,
                     createdOn: LocalDateTime = LocalDateTime.now(),
                     lastModified: LocalDateTime = LocalDateTime.now(),
                     version: Int = 1,
                     customProps: Option[JsValue] = None)

  case class DatasetCategory(categoryId: Long, datasetId: Long)

  case class UnclassifiedDataset(
      id: Option[Long],
      name: String,
      description: Option[String],
      dpClusterId: Long,
      createdBy: Long,
      createdOn: Option[LocalDateTime] = Some(LocalDateTime.now()),
      lastModified: Option[LocalDateTime] = Some(LocalDateTime.now()),
      customProps: Option[JsValue] = None)

  case class UnclassifiedDatasetCategory(categoryId: Long,
                                         unclassifiedDatasetId: Long)

  case class DataAsset(id: Option[Long],
                       assetType: String,
                       assetName: String,
                       assetDetails: String,
                       assetUrl: String,
                       assetProperties: JsValue,
                       datasetId: Long)

  case class DatasetDetails(id: Option[Long],
                            details: Option[JsValue],
                            datasetId: Long)

  case class DpConfig(id: Option[Long],
                      configKey: String,
                      configValue: String,
                      active: Option[Boolean] = Some(true),
                      // Special flag to allow exporting this key into ZK, or another
                      // should be implemented as a job to export all keys with this flag set
                      export: Option[Boolean] = Some(true))

  // classes as data conatiner for Rest Api

  case class DatasetAndCategories(dataset: Dataset, categories: Seq[Category])
  case class DatasetAndCategoryIds(dataset: Dataset, categories: Seq[Long])

}

object JsonFormatters {
  import com.hortonworks.dataplane.commons.domain.Entities._

  val defaultJson = Json.using[Json.WithDefaultValues]

  implicit val errorWrites = Json.writes[Error]
  implicit val errorReads = Json.reads[Error]

  implicit val errorsWrites = Json.writes[Errors]
  implicit val errorsReads = Json.reads[Errors]

  implicit val userWrites = Json.writes[User]
  implicit val userReads = Json.reads[User]

  implicit val roleWrites = Json.writes[Role]
  implicit val roleReads = Json.reads[Role]

  implicit val userRoleWrites = Json.writes[UserRole]
  implicit val userRoleReads = Json.reads[UserRole]

  implicit val userRolesWrites = Json.writes[UserRoles]
  implicit val userRolesReads = Json.reads[UserRoles]
  implicit val rolePermissionWrites = Json.writes[RolePermission]
  implicit val userPermissionWrites = Json.writes[UserPermission]

  implicit val permissionWrites = Json.writes[Permission]
  implicit val permissionReads = Json.reads[Permission]

  implicit val categoryWrites = Json.writes[Category]
  implicit val categoryReads = Json.reads[Category]

  implicit val locationWrites = Json.writes[Location]
  implicit val locationReads = Json.reads[Location]
  implicit val dpClusterWrites = Json.writes[DataplaneCluster]
  implicit val dpClusterReads = Json.reads[DataplaneCluster]

  implicit val skuWrites = Json.writes[Sku]
  implicit val skuReads = Json.reads[Sku]
  implicit val enabledSkuWrites = Json.writes[EnabledSku]
  implicit val enabledSkuReads = Json.reads[EnabledSku]

  implicit val clusterWrites = Json.writes[Cluster]
  implicit val clusterReads = Json.reads[Cluster]

  implicit val clusterServiceWrites = Json.writes[ClusterService]
  implicit val clusterServiceReads = Json.reads[ClusterService]

  implicit val hostWrites = Json.writes[ClusterServiceHost]
  implicit val hostReads = Json.reads[ClusterServiceHost]

  implicit val workspaceWrites = Json.writes[Workspace]
  implicit val workspaceReads = Json.reads[Workspace]

  implicit val assetWorkspaceWrites = Json.writes[AssetWorkspace]
  implicit val assetWorkspaceReads = Json.reads[AssetWorkspace]

  implicit val clusterHostWrites = Json.writes[ClusterHost]
  implicit val clusterHostReads = Json.reads[ClusterHost]

  implicit val clusterPropertiesWrites = Json.writes[ClusterProperties]
  implicit val clusterPropertiesReads = Json.reads[ClusterProperties]

  implicit val datasetWrites = Json.writes[Dataset]
  implicit val datasetReads = defaultJson.reads[Dataset]

  implicit val datasetCategoryWrites = Json.writes[DatasetCategory]
  implicit val datasetCategoryReads = Json.reads[DatasetCategory]

  implicit val unclassifiedDatasetWrites = Json.writes[UnclassifiedDataset]
  implicit val unclassifiedDatasetReads = Json.reads[UnclassifiedDataset]

  implicit val unclassifiedDatasetCategoryWrites =
    Json.writes[UnclassifiedDatasetCategory]
  implicit val unclassifiedDatasetCategoryReads =
    Json.reads[UnclassifiedDatasetCategory]

  implicit val dataAssetWrites = Json.writes[DataAsset]
  implicit val dataAssetReads = Json.reads[DataAsset]

  implicit val datasetDetailsWrites = Json.writes[DatasetDetails]
  implicit val datasetDetailsReads = Json.reads[DatasetDetails]

  // classes as data conatiner for Rest Api

  implicit val datasetResponseReads = Json.reads[DatasetAndCategories]
  implicit val datasetResponseWrites = Json.writes[DatasetAndCategories]

  implicit val datasetRequestReads = Json.reads[DatasetAndCategoryIds]
  implicit val datasetRequestWrites = Json.writes[DatasetAndCategoryIds]

  implicit val configReads = Json.reads[DpConfig]
  implicit val configWrites = Json.writes[DpConfig]

}
