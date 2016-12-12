package com.hw.dp.service.cluster

object DataConstraints{

  val dcTypes = Set("ON-PREMISE","AWS","AZURE")

}

case class Ambari(protocol:String = "http",host: String, port: Int, credentials: Credentials,dataCenter: String)

case class AmbariClusters(ambari: Ambari, clusters: Option[Seq[Cluster]] = None)

case class Cluster(name: String, version: String,ambariHost:String,dataCenter: String)

case class NameNode(clusterName:String,ambariHost:String,dataCenter: String,startTime:Long,capacityUsed:Long,capacityRemaining:Long,usedPercentage:Double,totalFiles:Long)

case class Host(name: String, clusterName:String,ambariHost:String,dataCenter: String,hostState: String, hostStatus: String, ip: String, cpu: Option[Int], diskStats: Option[List[DiskInfo]])

case class DiskInfo(available: Option[String], device: Option[String], used: Option[String], percentage: Option[String], size: Option[String], mountpoint: Option[String])

case class Location(place: String, country: String)

case class DataCenter(name: String,deployedAt:String = "ON-PREMISE",location: Option[Location])

case class Credentials(userName: String = "admin", password: String = "admin", kerberos:Option[KerberosSettings],properties: Map[String, String] = Map())

case class Service(name: String, clusterName:String,ambariHost:String)

case class ServiceComponent(name: String,serviceName:String,clusterName:String,ambariHost:String,dataCenter: String,state: String, hosts: Seq[String]=Seq())

case class ServiceConfiguration(serviceType:String,tag:String,version:String,properties:Map[String,String],service:Service,user:Option[String])

case class KerberosSettings(principal:String,keyTab:String)

case class ClusterMetric(clusterName:String,ambariHost:String,dataCenter: String,loadAvg:Double,dataSize:Long = 0L,capacityUtilization:Int = 0,totalDiskCapacity:Long = 0L)








