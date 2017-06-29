package com.hortonworks.dataplane.cs

import java.net.URL

import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import play.api.libs.json.JsValue

import scala.concurrent.Future

private[dataplane] case class Kerberos(user: String, ticket: String)

private[dataplane] case class AmbariConnection(
    status: Boolean,
    url: URL,
    kerberos: Option[Kerberos] = None,
    connectionError: Option[Throwable] = None)

private[dataplane] case class ServiceHost(host: String)

private[dataplane] case class Atlas(properties: String)

private[dataplane] case class NameNode(serviceHost: Seq[ServiceHost] = Seq(),
                                       props: Option[JsValue])

private[dataplane] case class Hdfs(serviceHost: Seq[ServiceHost] = Seq(),
                                   props: Option[JsValue])

private[dataplane] case class HiveServer(serviceHost: Seq[ServiceHost] = Seq(),
                                         props: Option[JsValue])

private[dataplane] case class HostInformation(hostState: String,
                                              hostStatus: String,
                                              name: String,
                                              ip: String,
                                              properties: Option[JsValue])

private[dataplane] case class KnoxInfo(properties: Option[JsValue])

private[dataplane] case class BeaconInfo(properties: Option[JsValue],
                                         endpoints: Seq[ServiceHost])

private[dataplane] case class Credentials(user: Option[String],
                                          pass: Option[String])

trait AmbariInterface {

  def ambariConnectionCheck: Future[AmbariConnection]

  def getAtlas: Future[Either[Throwable, Atlas]]

  def getBeacon: Future[Either[Throwable, BeaconInfo]]

  def getNameNodeStats: Future[Either[Throwable, NameNode]]

  def getHdfsInfo: Future[Either[Throwable, Hdfs]]

  def getHs2Info: Future[Either[Throwable, HiveServer]]

  def getGetHostInfo: Future[Either[Throwable, Seq[HostInformation]]]

  def getKnoxInfo: Future[Either[Throwable, KnoxInfo]]

}

trait AmbariInterfaceV2 {

  def getAtlas(
      implicit hJwtToken: Option[HJwtToken]): Future[Either[Throwable, Atlas]]

  def getBeacon(implicit hJwtToken: Option[HJwtToken])
    : Future[Either[Throwable, BeaconInfo]]

  def getNameNodeStats(implicit hJwtToken: Option[HJwtToken])
    : Future[Either[Throwable, NameNode]]

  def getHdfsInfo(
      implicit hJwtToken: Option[HJwtToken]): Future[Either[Throwable, Hdfs]]

  def getHs2Info(implicit hJwtToken: Option[HJwtToken])
    : Future[Either[Throwable, HiveServer]]

  def getGetHostInfo(implicit hJwtToken: Option[HJwtToken])
    : Future[Either[Throwable, Seq[HostInformation]]]

  def getKnoxInfo(implicit hJwtToken: Option[HJwtToken])
    : Future[Either[Throwable, KnoxInfo]]

}
