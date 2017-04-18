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

private[dataplane] case class HostInformation(hostState: String, hostStatus: String, ip: String, properties: Option[JsValue])

private [dataplane] case class KnoxInfo(properties:Option[JsValue])

private [dataplane] case class Credentials(user:Option[String],pass:Option[String])

trait AmbariInterface {

  def ambariConnectionCheck: Future[AmbariConnection]

  def getAtlas: Future[Either[Throwable, Atlas]]

  def getNameNodeStats:Future[Either[Throwable, NameNode]]

  def getGetHostInfo:Future[Either[Throwable, Seq[HostInformation]]]

  def getKnoxInfo:Future[Either[Throwable, KnoxInfo]]

}


