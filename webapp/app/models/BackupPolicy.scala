package models

import java.time.Instant

import play.api.libs.json.Json
import com.hw.dp.service.cluster.{DataCenter, Cluster}
import com.hw.dp.service.cluster.Formatters._

/**
  * Created by abkumar on 22/12/16.
  */

case class Source(dataCenterId: String, clusterId: String, resourceId: String, resourceType: String)

case class Target(dataCenterId: String, clusterId: String)

case class Status(isEnabled: Boolean, since: Instant)

case class BackupPolicy(label: String, source: Source, target: Target, status: Status)

case class SourceInDetail(dataCenter: DataCenter, cluster: Cluster, resourceId: String, resourceType: String)

case class TargetInDetail(dataCenter: DataCenter, cluster: Cluster)

case class BackupPolicyInDetail(label: String, source: SourceInDetail, target: TargetInDetail, status: Status)


object BackupPolicyFormatters {


  implicit val sourceReads = Json.reads[Source]

  implicit val sourceWrites = Json.writes[Source]


  implicit val targetReads = Json.reads[Target]

  implicit val targetWrites = Json.writes[Target]


  implicit val statusReads = Json.reads[Status]

  implicit val statusWrites = Json.writes[Status]


  implicit val backupPolicyReads = Json.reads[BackupPolicy]

  implicit val backupPolicyWrites = Json.writes[BackupPolicy]



  implicit val sourceInDetailReads = Json.reads[SourceInDetail]

  implicit val sourceInDetailWrites = Json.writes[SourceInDetail]


  implicit val targetInDetailReads = Json.reads[TargetInDetail]

  implicit val targetInDetailWrites = Json.writes[TargetInDetail]


  implicit val backupPolicyInDetailReads = Json.reads[BackupPolicyInDetail]

  implicit val backupPolicyInDetailWrites = Json.writes[BackupPolicyInDetail]

}
