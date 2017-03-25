package com.hortonworks.dataplane.cs

import java.net.URL

import play.api.libs.json.JsValue

import scala.concurrent.Future


private[dataplane] case class Kerberos(user: String, ticket: String)

private[dataplane] case class AmbariConnection(
                                                status: Boolean,
                                                url: URL,
                                                kerberos: Option[Kerberos] = None,
                                                connectionError: Option[Throwable] = None)

private[dataplane] case class Atlas(restService: URL,properties:String)

private[dataplane] case class NameNode(startTime:Long,capacityUsed:Long,capacityRemaining:Long,usedPercentage:Double,totalFiles:Long,props:Option[JsValue])

private[dataplane] case class HostInformation(hostState: String, hostStatus: String, ip: String, cpu: Option[Int], diskStats: Option[List[DiskInformation]])

private[dataplane] case class DiskInformation(available: Option[String], device: Option[String], used: Option[String], percentage: Option[String], size: Option[String], mountpoint: Option[String])

private [dataplane] case class KnoxInfo(properties:Option[JsValue])

trait AmbariInterface {

  def ambariConnectionCheck: Future[AmbariConnection]

  def getAtlas(ambari: AmbariConnection): Future[Either[Throwable, Atlas]]

  def getNameNodeStats(ambari: AmbariConnection):Future[Either[Throwable, NameNode]]

  def getGetHostInfo(ambari: AmbariConnection):Future[Either[Throwable, Seq[HostInformation]]]

  def getKnoxInfo(ambari: AmbariConnection):Future[Either[Throwable, KnoxInfo]]

}
