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

package models

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster}
import play.api.libs.json.Json
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

object RequestSyntax {
  case class RegisterDpCluster(lake: DataplaneCluster, cluster: Cluster)
}

object Formatters {
  import models.RequestSyntax._

  implicit val registerDpClusterWrites = Json.writes[RegisterDpCluster]
  implicit val registerDpClusterReads = Json.reads[RegisterDpCluster]
}
