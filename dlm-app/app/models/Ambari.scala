
/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package models

import play.api.libs.json.{Json,JsValue}

object Ambari {
  case class ServiceComponentInfo (component_name: String, total_count: Int)
  case class HostRoles(component_name: String, host_name: String)
  case class FSNamesystem(HAState : String)
  case class Dfs(`FSNamesystem` : FSNamesystem)
  case class Metrics(dfs: Dfs)
  case class HostComponent(`HostRoles`: HostRoles, metrics: Metrics)
  case class HostComponents(`ServiceComponentInfo`: JsValue, host_components: Seq[HostComponent])
  case class RangerProperties(policymgr_external_url: Option[String], `ranger.plugin.hdfs.service.name`: Option[String],
                              `ranger.plugin.hive.service.name`: Option[String])
  case class AtlasProperties(`atlas.rest.address`: Option[String], `atlas.authentication.method.kerberos`: Option[String], `atlas.sso.knox.providerurl`: Option[String])
  case class ConfigKey(cluster_name: String, stack_id: String)
  case class ServiceConfigurations(Config: ConfigKey, `type`: String, properties: JsValue)
  case class ActiveServiceConfigurations(service_name: String, configurations: Seq[ServiceConfigurations])
  case class ActiveDefaultConfiguration(items: Seq[ActiveServiceConfigurations])

  case class ServiceHostComponent(component_name: String, host_name: String, public_host_name: String)
  case class ServiceHostRoles(HostRoles: ServiceHostComponent)
  case class ServiceHostComponents(ServiceComponentInfo: JsValue, host_components: Seq[ServiceHostRoles])

  case class AmbariUserAuthInfo(authorization_id: String, authorization_name: String, user_name: String)
  case class AmbariUserAuth(AuthorizationInfo: AmbariUserAuthInfo)
  case class AmbariUserInfo(id: Long, data: AmbariUserAuth)
  case class AmbariUserWithMultiplePrivilegeInfo(id: Long, data: Seq[AmbariUserAuth])
  case class AmbariUserReadPrivelege(clusterId: Long, isConfigReadAuthEnabled: Boolean)

  implicit val serviceComponentInfoReads = Json.reads[ServiceComponentInfo]
  implicit val serviceComponentInfoWrites = Json.writes[ServiceComponentInfo]
  implicit val hostRolesReads = Json.reads[HostRoles]
  implicit val hostRolesWrites = Json.writes[HostRoles]
  implicit val fSNamesystemReads = Json.reads[FSNamesystem]
  implicit val fSNamesystemWrites = Json.writes[FSNamesystem]
  implicit val dfsReads = Json.reads[Dfs]
  implicit val dfsWrites = Json.writes[Dfs]
  implicit val metricsReads = Json.reads[Metrics]
  implicit val metricsWrites = Json.writes[Metrics]
  implicit val hostComponentReads = Json.reads[HostComponent]
  implicit val hostComponentWrites = Json.writes[HostComponent]
  implicit val hostComponentsReads = Json.reads[HostComponents]
  implicit val hostComponentsWrites = Json.writes[HostComponents]
  implicit val configKeyReads = Json.reads[ConfigKey]
  implicit val configKeyWrites = Json.writes[ConfigKey]
  implicit val rangerPropertiesReads = Json.reads[RangerProperties]
  implicit val rangerPropertiesWrites = Json.writes[RangerProperties]
  implicit val atlasPropertiesFmt = Json.format[AtlasProperties]
  implicit val serviceConfigurationsReads = Json.reads[ServiceConfigurations]
  implicit val serviceConfigurationsWrites = Json.writes[ServiceConfigurations]
  implicit val activeServiceConfigurationsReads = Json.reads[ActiveServiceConfigurations]
  implicit val activeServiceConfigurationsWrites = Json.writes[ActiveServiceConfigurations]
  implicit val activeDefaultConfigurationReads = Json.reads[ActiveDefaultConfiguration]
  implicit val activeDefaultConfigurationWrites = Json.writes[ActiveDefaultConfiguration]
  implicit val ambariUserAuthInfoFormat = Json.format[AmbariUserAuthInfo]
  implicit val ambariUserAuthWritesFormat = Json.format[AmbariUserAuth]
  implicit val ambariUserInfoFormat = Json.format[AmbariUserInfo]
  implicit val ambariUserWithMultiplePrivilegeInfoFormat = Json.format[AmbariUserWithMultiplePrivilegeInfo]
  implicit val ambariUserReadPrivelegeFormat = Json.format[AmbariUserReadPrivelege]
}
