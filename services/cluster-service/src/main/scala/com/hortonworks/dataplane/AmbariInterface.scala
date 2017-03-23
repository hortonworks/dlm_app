package com.hortonworks.dataplane

import java.net.URL

import scala.concurrent.Future


private[dataplane] case class Kerberos(user: String, ticket: String)

private[dataplane] case class AmbariConnection(
                                                status: Boolean,
                                                url: URL,
                                                kerberos: Option[Kerberos],
                                                connectionError: Option[Throwable])

private[dataplane] case class Atlas(restService: URL)

trait AmbariInterface {

  def ambariConnectionCheck: Future[AmbariConnection]

  def getAtlas(ambari: AmbariConnection):  Future[Atlas]

}
