package com.hortonworks.dataplane.cs

import java.net.{MalformedURLException, URL}

import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.typesafe.scalalogging.Logger
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSAuthScheme, WSClient}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class SimpleAmbariInterfaceImpl(private val cluster: Cluster)(
    implicit ws: WSClient)
    extends AmbariInterface {

  val logger = Logger(classOf[SimpleAmbariInterfaceImpl])

  override def ambariConnectionCheck: Future[AmbariConnection] = {
    // use the cluster definition to get Ambari
    // hit Ambari API clusters interface to check connectivity
    logger.info("Starting Ambari connection check")
    // preconditions
    require(cluster.ambariUrl.isDefined, "No Ambari URL defined")
    require(cluster.ambariuser.isDefined, "No Ambari user defined")
    require(cluster.ambaripass.isDefined, "No Ambari password defined")
    require(
      if (cluster.secured.isDefined && cluster.secured.get == true)
        cluster.kerberosuser.isDefined && cluster.kerberosticketLocation.isDefined
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
        if (res.status != 200)
          logger.warn(
            s"Ambari connection works but received a ${res.status} as response" +
              s"This may cause future operations to fail")

        val kerberos =
          if (cluster.secured.get)
            Some(
              Kerberos(cluster.kerberosuser.get,
                       cluster.kerberosticketLocation.get))
          else None

        AmbariConnection(status = true, url.get, kerberos, None)
      }
      .recoverWith {
        case e: Exception =>
          logger.error("Could not connect to Ambari")
          Future.successful(AmbariConnection(status = false, url.get, None, Some(e)))
      }

  }

  override def getAtlas(
      ambari: AmbariConnection): Future[Either[Throwable, Atlas]] = {
    logger.info("Trying to get data from Atlas")
    require(ambari.status, "Ambari connection is invalid")

    val serviceSuffix =
      s"/api/v1/clusters/${cluster.name}/configurations/service_config_versions?service_name=ATLAS&is_current=true"
    ws.url(s"${ambari.url.toString}$serviceSuffix")
      .withAuth(cluster.ambariuser.get,
                cluster.ambaripass.get,
                WSAuthScheme.BASIC)
      .get()
      .map { res =>
        val json = res.json
        val configurations = json \ "items" \\ "configurations"
        val configs: JsValue = configurations.head
        val configsAsList = configs.as[List[JsObject]]
        val atlasConfig = configsAsList.find(obj =>
          (obj \ "type").as[String] == "application-properties")
        if (atlasConfig.isEmpty)
          Left(ServiceNotFound("No properties found for Atlas"))
        val properties = (atlasConfig.get \ "properties").as[JsObject]
        val apiUrl = (properties \ "atlas.rest.address").as[String]
        val restService = Try(new URL(apiUrl))
        restService.map(url =>
          Right(Atlas(url, Json.stringify(configs)))).getOrElse(
          Left(new MalformedURLException(s"Cannot parse $apiUrl")))

      }
      .recoverWith {
        case e: Exception =>
          logger.error("Cannot get Atlas info")
          Future.successful(
            Left(e))
      }
  }
}
