package com.hortonworks.dataplane

import java.net.URL

import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.typesafe.scalalogging.Logger
import play.api.libs.ws.{WSAuthScheme, WSClient}

import scala.concurrent.Future
import scala.util.Try

class SimpleAmbariInterfaceImpl(private val cluster: Cluster)(
    implicit ws: WSClient)
    extends AmbariInterface {

  val logger = Logger(classOf[SimpleAmbariInterfaceImpl])

  override def ambariConnectionCheck: Future[AmbariConnection] = {
    // use the cluster definition to get Ambari
    // hit the Ambari API clusters interface to check connectivity
    logger.info("Starting Ambari connection check")
    // preconditions
    require(cluster.ambariUrl.isDefined, "No Ambari URL defined")
    require(cluster.ambariuser.isDefined, "No Ambari user defined")
    require(cluster.ambaripass.isDefined, "No Ambari password defined")
    require(
      if (cluster.secured.isDefined)
        (cluster.kerberosuser.isDefined && cluster.kerberosticketLocation.isDefined)
      else true,
      "Secure cluster added but Kerberos user/ticket not defined"
    )
    val url = Try(new URL(cluster.ambariUrl.get))
    require(url.isSuccess, "registered Ambari url is invalid")
    //Hit ambari URL
    ws.url(s"${url.get.toString}/api/v1/clusters")
      .withAuth(cluster.ambariuser.get,
                cluster.ambaripass.get,
                WSAuthScheme.BASIC)
      .get()
      .map { res =>
        logger.info(s"Successfully connected to Ambari $res")
        if(res.status != 200)
          logger.warn(s"Ambari connection works but received a ${res.status} as response" +
            s"This may cause future operations to fail")

        val kerberos =
          if (cluster.secured.get)
            Some(
              Kerberos(cluster.kerberosuser.get,
                       cluster.kerberosticketLocation.get))
          else None

        AmbariConnection(true, url.get, kerberos, None)
      }
      .recoverWith {
        case e: Exception =>
          logger.error("Could not connect to Ambari")
          Future.successful(AmbariConnection(true, url.get, None, Some(e)))
      }

  }

  override def getAtlas(ambari: AmbariConnection): Future[Atlas] = ???
}
