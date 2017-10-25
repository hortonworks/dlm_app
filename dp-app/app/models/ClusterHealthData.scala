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

import com.hortonworks.dataplane.commons.domain.Ambari.{ClusterHost, NameNodeInfo}
import play.api.libs.json.Json

case class ClusterHealthData(nameNodeInfo: Option[NameNodeInfo],
                             hosts: Seq[ClusterHost] = Seq(),
                             syncState: Option[String])

object ClusterHealthData {
  implicit val clusterHealthDataWrites = Json.writes[ClusterHealthData]
  implicit val clusterHealthDataReads = Json.reads[ClusterHealthData]
}



