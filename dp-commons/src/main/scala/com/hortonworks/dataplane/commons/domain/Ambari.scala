package com.hortonworks.dataplane.commons.domain

import play.api.libs.json.Json

/**
  * Ambari Specific Data models
  * The names of properties is mapped to those returned from
  * Ambari API's
  */
object Ambari {

  case class DiskInfo(
      available: Option[String],
      device: Option[String],
      used: Option[String],
      percent: Option[String],
      size: Option[String],
      `type`: Option[String],
      mountpoint: Option[String]
  )
  case class ClusterHost(
      cluster_name: String,
      cpu_count: Option[Double],
      disk_info: Option[List[DiskInfo]],
      host_health_report: Option[String],
      host_name: Option[String],
      host_state: Option[String],
      host_status: Option[String],
      ip: Option[String],
      last_heartbeat_time: Option[Double],
      last_registration_time: Option[Double],
      maintenance_state: Option[String],
      os_arch: Option[String],
      os_family: Option[String],
      os_type: Option[String],
      ph_cpu_count: Option[Double],
      public_host_name: Option[String],
      rack_info: Option[String],
      recovery_summary: Option[String],
      total_mem: Option[Double]
  )

  case class NameNodeInfo(
      CapacityRemaining: Option[Double],
      CapacityTotal: Option[Double],
      CapacityUsed: Option[Double],
      DeadNodes: Option[String],
      DecomNodes: Option[String],
      HeapMemoryMax: Option[Double],
      HeapMemoryUsed: Option[Double],
      LiveNodes: Option[String],
      NonDfsUsedSpace: Option[Double],
      NonHeapMemoryMax: Option[Double],
      NonHeapMemoryUsed: Option[Double],
      PercentRemaining: Option[Double],
      PercentUsed: Option[Double],
      Safemode: Option[String],
      StartTime: Option[Double],
      TotalFiles: Option[Double],
      display_name: Option[String],
      service_name: Option[String],
      state: Option[String]
  )

  implicit val diskInfoReads = Json.reads[DiskInfo]
  implicit val diskInfoWrites = Json.writes[DiskInfo]
  implicit val clusterHealthWrites = Json.writes[ClusterHost]
  implicit val clusterHealthReads = Json.reads[ClusterHost]
  implicit val nameNodeWrites = Json.writes[NameNodeInfo]
  implicit val nameNodeReads = Json.reads[NameNodeInfo]

}
