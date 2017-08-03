package com.hortonworks.dataplane.commons.domain

import java.time.LocalDateTime

import com.hortonworks.dataplane.commons.domain.Atlas.AtlasSearchQuery
import play.api.libs.json.{JsValue, Json, Reads, Writes}

/**
  * Data plane main domain entities
  * add objects here which should be persisted
  */
object Entities {

  case class HJwtToken(token: String)

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
                  groupManaged: Option[Boolean] = Some(false),
                  created: Option[LocalDateTime] = Some(LocalDateTime.now()),
                  updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

  case class Group(id: Option[Long] = None,
                   groupName: String,
                   displayName: String,
                   active: Option[Boolean] = Some(true),
                   created: Option[LocalDateTime] = Some(LocalDateTime.now()),
                   updated: Option[LocalDateTime] = Some(LocalDateTime.now()))

  case class GroupsList(total: Int, groups: Seq[GroupInfo])

  case class UsersList( total: Int, users: Seq[UserInfo])

  case class UserInfo(id: Option[Long] = None,
                  userName: String,
                  displayName: String,
                  password: Option[String]=None,
                  active: Option[Boolean] = Some(true),
                  roles: Seq[RoleType.Value]=Seq()
                  )

  case class UserGroupInfo(id: Option[Long] = None,
                  userName: String,
                  displayName: String,
                  password: Option[String]=None,
                  active: Option[Boolean] = Some(true),
                  groupIds: Seq[Long]=Seq()
                 )
  case class UserContext(id:Option[Long],
                         username:String,
                         avatar:Option[String],
                         active: Option[Boolean] = Some(true),
                         roles:Seq[String],
                         display:Option[String],
                         token:Option[String],
                         password:Option[String])

  case class GroupInfo(id: Option[Long] = None,
                      groupName: String,
                      displayName: String,
                      active: Option[Boolean] = Some(true),
                      roles: Seq[RoleType.Value]=Seq()
                     )

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
  case class UserGroup(id: Option[Long] = None,
                       userId: Option[Long],
                       groupId: Option[Long])

  case class UserRoles(username: String, roles: Seq[String])

  case class GroupRoles(groupName: String, roles: Seq[String])

  case class GroupRole(id: Option[Long] = None,
                       groupId: Option[Long],
                       roleId: Option[Long])

  case class RolePermission(role: String, permissions: Seq[String])

  case class UserPermission(username: String, rights: Seq[RolePermission])

  //Data lake
  case class Location(
      id: Option[Long] = None,
      city: String,
      province: String,
      country: String,
      latitude: Float,
      longitude: Float
  )

  case class DataplaneClusterIdentifier(id: Long)

  case class DataplaneCluster(
      id: Option[Long] = None,
      name: String,
      dcName: String,
      description: String,
      ambariUrl: String,
      location: Option[Long],
      createdBy: Option[Long],
      properties: Option[JsValue],
      // state should be used to figure out the status of the cluster
      state: Option[String] = Some("TO_SYNC"),
      isDatalake: Option[Boolean] = Some(false),
      knoxEnabled: Option[Boolean] = Some(false),
      knoxUrl: Option[String],
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
      clusterUrl: Option[String] = None,
      secured: Option[Boolean] = Some(false),
      kerberosuser: Option[String] = None,
      kerberosticketLocation: Option[String] = None,
      dataplaneClusterId: Option[Long] = None,
      userid: Option[Long] = None,
      properties: Option[JsValue] = None
  )

  case class ClusterService(
      id: Option[Long] = None,
      servicename: String,
      properties: Option[JsValue] = None,
      clusterId: Option[Long] = None
  )

  case class ClusterServiceHost(
      id: Option[Long] = None,
      host: String,
      serviceid: Option[Long] = None
  )

  case class Workspace(
      id: Option[Long] = None,
      name: String,
      source: Long,
      description: String,
      createdBy: Option[Long],
      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
      updated: Option[LocalDateTime] = Some(LocalDateTime.now())
  )

  case class AssetWorkspace(
      assetType: String,
      assetId: Long,
      workspaceId: Long
  )

  case class NotebookWorkspace(
      notebookId: String,
      name: String,
      created: Option[LocalDateTime] = Some(LocalDateTime.now()),
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
                     createdBy: Option[Long],
                     createdOn: LocalDateTime = LocalDateTime.now(),
                     lastModified: LocalDateTime = LocalDateTime.now(),
                     active: Boolean = true,
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
                       guid: String,
                       assetProperties: JsValue,
                       clusterId: Long,
                       datasetId: Option[Long] = None)

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

  case class DataAssetCount(assetType: String, count: Int)

  case class RichDataset(dataset: Dataset,
                         tags: Seq[String],
                         user: String,
                         cluster: String,
                         clusterId: Long,
                         counts: Seq[DataAssetCount])

  case class DatasetAndCategories(dataset: Dataset, categories: Seq[Category])

  case class DatasetAndCategoryIds(dataset: Dataset, categories: Seq[Long])

  case class CategoryCount(name: String, count: Int)

  case class CategoriesCountAndTotal(categoies: Seq[CategoryCount], total: Int)

  case class DatasetCreateRequest(dataset: Dataset,
                                  clusterId: Long,
                                  tags: Seq[String],
                                  assetQueryModels: Seq[AtlasSearchQuery],
                                  dataAssets: Seq[DataAsset] = Nil)
  case class LdapConfiguration(
                              id: Option[Long],
                              ldapUrl:String,
                              bindDn: Option[String],
                              userSearchBase: Option[String],
                              userSearchAttributeName:Option[String],
                              groupSearchBase: Option[String],
                              groupSearchAttributeName:Option[String],
                              groupObjectClass:Option[String],
                              groupMemberAttributeName: Option[String]
                              )

  case class WorkspaceDataCount(asset: Int, notebook: Int)

  case class WorkspaceDetails(
      workspace: Workspace,
      username: String,
      clustername: String,
      counts: Option[WorkspaceDataCount]
  )

  case class AssetWorkspaceRequest(workspaceId: Long,
                                   clusterId: Long,
                                   assetQueryModels: Seq[AtlasSearchQuery],
                                   dataAssets: Seq[DataAsset] = Nil)

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
  implicit val dpClusterIdentifierWrites = Json.writes[DataplaneClusterIdentifier]
  implicit val dpClusterIdentifierReads = Json.reads[DataplaneClusterIdentifier]

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
  implicit val categoriesCountReads = Json.reads[CategoryCount]
  implicit val categoriesCountWrites = Json.writes[CategoryCount]

  implicit val dataAssetCountReads = Json.reads[DataAssetCount]
  implicit val dataAssetCountWrites = Json.writes[DataAssetCount]

  implicit val datasetResponseReads = Json.reads[DatasetAndCategories]
  implicit val datasetResponseWrites = Json.writes[DatasetAndCategories]

  implicit val datasetRequestReads = Json.reads[DatasetAndCategoryIds]
  implicit val datasetRequestWrites = Json.writes[DatasetAndCategoryIds]

  implicit val configReads = Json.reads[DpConfig]
  implicit val configWrites = Json.writes[DpConfig]

  implicit val categoriesCountAndTotalReads =
    Json.reads[CategoriesCountAndTotal]
  implicit val categoriesCountAndTotalWrites =
    Json.writes[CategoriesCountAndTotal]

  implicit val datasetCreateRequestReads =
    defaultJson.reads[DatasetCreateRequest]
  implicit val datasetCreateRequestWrites = Json.writes[DatasetCreateRequest]

  implicit val richDatasetReads = defaultJson.reads[RichDataset]
  implicit val richDatasetWrites = Json.writes[RichDataset]

  implicit val ldapConfigurationReads = Json.reads[LdapConfiguration]
  implicit val ldapConfigurationWrites= Json.writes[LdapConfiguration]

  implicit val workspacesAndCountReads = Json.reads[WorkspaceDataCount]
  implicit val workspacesAndCountWrites = Json.writes[WorkspaceDataCount]

  implicit val workspaceDetailsReads = Json.reads[WorkspaceDetails]
  implicit val workspaceDetailsWrites = Json.writes[WorkspaceDetails]

  implicit val assetWorkspaceRequestReads =
    defaultJson.reads[AssetWorkspaceRequest]
  implicit val assetWorkspaceRequestWrites = Json.writes[AssetWorkspaceRequest]

  implicit val notebookWorkspaceReads = defaultJson.reads[NotebookWorkspace]
  implicit val notebookWorkspaceWrites = Json.writes[NotebookWorkspace]

  implicit val roleTypeReads = Reads.enumNameReads(RoleType)

  implicit val userInfoReads = Json.reads[UserInfo]
  implicit val userInfoWrites = Json.writes[UserInfo]

  implicit val usersListWrites = Json.writes[UsersList]
  implicit  val usersListReads = Json.reads[UsersList]


  implicit val groupReads = Json.reads[Group]
  implicit val groupWrites = Json.writes[Group]

  implicit val groupInfoReads = Json.reads[GroupInfo]
  implicit val groupInfoWrites = Json.writes[GroupInfo]

  implicit val groupsListWrites = Json.writes[GroupsList]
  implicit  val groupsListReads = Json.reads[GroupsList]

  implicit val userContextWrites= Json.writes[UserContext]
  implicit val userContextReads= Json.reads[UserContext]

  implicit val userGroupInfoWrites= Json.writes[UserGroupInfo]
  implicit val userGroupInfoReads= Json.reads[UserGroupInfo]

}
