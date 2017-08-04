
/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
}
