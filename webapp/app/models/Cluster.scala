package models

import scala.concurrent.duration.Duration


case class Location(place: Option[String], country: Option[String])

case class DataCenter(name: String, location: Option[Location])

case class Cluster(name: String,url:String,clusterUser:ClusterCredentials)

case class ClusterCredentials(userName:String,password:String,properties:Option[Map[String,String]])


