package com.hortonworks.dataplane.cs

import java.net.URL

import scala.concurrent.Future


private[dataplane] case class Kerberos(user: String, ticket: String)

private[dataplane] case class AmbariConnection(
                                                status: Boolean,
                                                url: URL,
                                                kerberos: Option[Kerberos] = None,
                                                connectionError: Option[Throwable] = None)

private[dataplane] case class Atlas(restService: URL,properties:String)

trait AmbariInterface {

  def ambariConnectionCheck: Future[AmbariConnection]

  def getAtlas(ambari: AmbariConnection): Future[Either[Throwable, Atlas]]

}
