/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.commons.domain

import java.time.LocalDateTime

import com.hortonworks.dataplane.commons.domain.Atlas.AtlasSearchQuery
import org.apache.commons.lang3.exception.ExceptionUtils
import play.api.libs.json.{JsValue, Json, Reads}

/**
  * Data plane main domain entities
  * add objects here which should be persisted
  */
object Entities {

  import scala.reflect.runtime.universe._

  // Routine to get field names for a class
  def fieldsNames[T: TypeTag]: Set[String] =
    typeOf[T].members.collect {
      case m: MethodSymbol if m.isCaseAccessor => m.fullName
    }.toSet

  object ErrorType extends Enumeration {
    type ErrorType = Value
    val General, Network, Database, Cluster, Ambari, Url = Value

    implicit class WrappedThrowable(th: Throwable) {
      def asError(code: String, errorType: ErrorType): Errors =
        Errors(
          Seq(
            Error(code, ExceptionUtils.getStackTrace(th), errorType.toString)))
    }

  }

  case class HJwtToken(token: String)

  case class Error(code: String,
                   message: String,
                   errorType: String = ErrorType.General.toString)

  case class Errors(errors: Seq[Error] = Seq()) {
    def combine(newErrors: Errors) = Errors(errors ++ newErrors.errors)

    def firstMessage = errors.headOption.map(_.code).getOrElse("Unknown Error")
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

  case class UsersList(total: Int, users: Seq[UserInfo])

  case class UserInfo(id: Option[Long] = None,
                      userName: String,
                      displayName: String,
                      password: Option[String] = None,
                      active: Option[Boolean] = Some(true),
                      roles: Seq[RoleType.Value] = Seq())

  case class UserGroupInfo(id: Option[Long] = None,
                           userName: String,
                           displayName: String,
                           password: Option[String] = None,
                           active: Option[Boolean] = Some(true),
                           groupIds: Seq[Long] = Seq())

  case class UserContext(id: Option[Long],
                         username: String,
                         avatar: Option[String],
                         roles: Seq[String],
                         services: Seq[String],
                         display: Option[String],
                         token: Option[String],
                         password: Option[String],
                         active: Option[Boolean] = Some(true),
                         dbManaged: Option[Boolean] = Some(true),
                         groupManaged: Option[Boolean] = Some(false),
                         updatedAt: Option[Long])

  case class UserLdapGroups(userName: String, ldapGroups: Seq[String])

  case class GroupInfo(id: Option[Long] = None,
                       groupName: String,
                       displayName: String,
                       active: Option[Boolean] = Some(true),
                       roles: Seq[RoleType.Value] = Seq())

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

  case class UserGroups(username: String, groups: Seq[Group])

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
                               ambariIpAddress: String,
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

  case class DpClusterWithDpServices(
                                      dataplaneCluster: DataplaneCluster,
                                      dpServices: Seq[String])

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

  case class ServiceDependency(serviceName: String, mandatoryDependencies: Seq[String], optionalDependencies: Seq[String])

  case class DpService(skuName: String,
                       enabled: Boolean,
                       sku: Sku,
                       enabledSku: Option[EnabledSku])

  case class DpServiceEnableConfig(skuName: String, smartSenseId: String)

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
                                ldapUrl: Option[String] = None,
                                bindDn: Option[String] = None,
                                userSearchBase: Option[String] = None,
                                userSearchAttributeName: Option[String] = None,
                                groupSearchBase: Option[String] = None,
                                groupSearchAttributeName: Option[String] = None,
                                groupObjectClass: Option[String] = None,
                                groupMemberAttributeName: Option[String] = None
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

  case class BlacklistedToken(id: Option[Long], token: String, expiry: LocalDateTime)

}

object JsonFormatters {

  import com.hortonworks.dataplane.commons.domain.Entities._

  val defaultJson = Json.using[Json.WithDefaultValues]
  implicit val errorFormat = Json.format[Error]
  implicit val errorsFormat = Json.format[Errors]
  implicit val userFormat = Json.format[User]
  implicit val roleFormat = Json.format[Role]
  implicit val userRoleFormat = Json.format[UserRole]
  implicit val userRolesFormat = Json.format[UserRoles]
  implicit val rolePermissionWrites = Json.format[RolePermission]
  implicit val userPermissionWrites = Json.format[UserPermission]
  implicit val permissionFormat = Json.format[Permission]
  implicit val categoryFormat = Json.format[Category]
  implicit val locationFormat = Json.format[Location]
  implicit val dpClusterFormat = Json.format[DataplaneCluster]
  implicit val dpClusterWithDpServicesFormat = Json.format[DpClusterWithDpServices]
  implicit val dpClusterIdentifierFormat =
    Json.format[DataplaneClusterIdentifier]
  implicit val skuFormat = Json.format[Sku]
  implicit val enabledSkuFormat = Json.format[EnabledSku]
  implicit val clusterFormat = Json.format[Cluster]
  implicit val clusterServiceFormat = Json.format[ClusterService]
  implicit val hostFormat = Json.format[ClusterServiceHost]
  implicit val workspaceFormat = Json.format[Workspace]
  implicit val assetWorkspaceFormat = Json.format[AssetWorkspace]
  implicit val clusterHostFormat = Json.format[ClusterHost]
  implicit val clusterPropertiesFormat = Json.format[ClusterProperties]
  implicit val datasetWrites = Json.writes[Dataset]
  implicit val datasetReads = defaultJson.reads[Dataset]
  implicit val datasetCategoryFormat = Json.format[DatasetCategory]
  implicit val unclassifiedDatasetFormat = Json.format[UnclassifiedDataset]
  implicit val unclassifiedDatasetCategoryFormat =
    Json.format[UnclassifiedDatasetCategory]
  implicit val dataAssetFormat = Json.format[DataAsset]
  implicit val datasetDetailsFormat = Json.format[DatasetDetails]
  implicit val categoriesCountFormat = Json.format[CategoryCount]
  implicit val dataAssetCountFormat = Json.format[DataAssetCount]
  implicit val datasetResponseFormat = Json.format[DatasetAndCategories]
  implicit val datasetRequestFormat = Json.format[DatasetAndCategoryIds]
  implicit val configFormat = Json.format[DpConfig]
  implicit val categoriesCountAndTotalFormat =
    Json.format[CategoriesCountAndTotal]
  implicit val datasetCreateRequestReads =
    defaultJson.reads[DatasetCreateRequest]
  implicit val datasetCreateRequestWrites = Json.writes[DatasetCreateRequest]
  implicit val richDatasetReads = defaultJson.reads[RichDataset]
  implicit val richDatasetWrites = Json.writes[RichDataset]
  implicit val ldapConfigurationFormat = Json.format[LdapConfiguration]
  implicit val workspacesAndCountFormat = Json.format[WorkspaceDataCount]
  implicit val workspaceDetailsFormat = Json.format[WorkspaceDetails]
  implicit val assetWorkspaceRequestReads =
    defaultJson.reads[AssetWorkspaceRequest]
  implicit val assetWorkspaceRequestWrites = Json.writes[AssetWorkspaceRequest]
  implicit val notebookWorkspaceReads = defaultJson.reads[NotebookWorkspace]
  implicit val notebookWorkspaceWrites = Json.writes[NotebookWorkspace]
  implicit val roleTypeReads = Reads.enumNameReads(RoleType)
  implicit val userInfoFormat = Json.format[UserInfo]
  implicit val usersListFormat = Json.format[UsersList]
  implicit val groupFormat = Json.format[Group]
  implicit val groupInfoFormat = Json.format[GroupInfo]
  implicit val groupsListFormat = Json.format[GroupsList]
  implicit val userContextFormat = Json.format[UserContext]
  implicit val userGroupInfoFormat = Json.format[UserGroupInfo]
  implicit val userLdapGroupsFormat = Json.format[UserLdapGroups]
  implicit val dpServiceFormat = Json.format[DpService]
  implicit val dpServiceEnableConfigFormat = Json.format[DpServiceEnableConfig]
  implicit val serviceDependencyFormat = Json.format[ServiceDependency]
  implicit val blacklistedTokenFormats = Json.format[BlacklistedToken]

}
