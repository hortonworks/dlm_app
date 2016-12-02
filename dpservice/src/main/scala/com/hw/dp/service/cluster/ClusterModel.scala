package com.hw.dp.service.cluster

import java.util.Date


case class Ambari(protocol:String = "http",host: String, port: Int, credentials: Credentials,dataCenter: Option[String])

case class AmbariDatacenter(ambari: Ambari,dataCenter: DataCenter)

case class AmbariClusters(ambari: Ambari, clusters: Option[Seq[Cluster]] = None)

case class Cluster(name: String, version: String,ambariHost:String)

case class NameNode(clusterName:String,ambariHost:String,startTime:Long)

case class Host(name: String, clusterName:String,ambariHost:String,hostState: String, hostStatus: String, ip: String, cpu: Option[Int], diskStats: Option[List[DiskInfo]])

case class DiskInfo(available: Option[String], device: Option[String], used: Option[String], percentage: Option[String], size: Option[String], mountpoint: Option[String])

case class Location(place: Option[String], country: Option[String])

case class DataCenter(name: String, location: Option[Location])

case class Credentials(userName: String = "admin", password: String = "admin", properties: Map[String, String] = Map())

case class Service(name: String, clusterName:String,ambariHost:String)

case class ServiceComponent(name: String,serviceName:String,clusterName:String,ambariHost:String,state: String, hosts: Seq[String]=Seq())

case class ServiceConfiguration(serviceType:String,tag:String,version:String,properties:Map[String,String],service:Service,user:Option[String])










