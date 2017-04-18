package com.hortonworks.dataplane.cs

import java.net.{MalformedURLException, URL}

import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.typesafe.scalalogging.Logger
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class AmbariClusterInterface(private val cluster: Cluster,credentials: Credentials)(
    implicit ws: WSClient)
    extends AmbariInterface {

  val logger = Logger(classOf[AmbariClusterInterface])

  override def ambariConnectionCheck: Future[AmbariConnection] = {
    // use the cluster definition to get Ambari
    // hit Ambari API clusters interface to check connectivity
    logger.info("Starting Ambari connection check")
    // preconditions
    require(cluster.ambariurl.isDefined, "No Ambari URL defined")
    require(credentials.user.isDefined, "No Ambari user defined")
    require(credentials.user.isDefined, "No Ambari password defined")
    require(
      if (isClusterKerberized)
        cluster.kerberosuser.isDefined && cluster.kerberosticketLocation.isDefined
      else true,
      "Secure cluster added but Kerberos user/ticket not defined"
    )
    val url = Try(new URL(cluster.ambariurl.get))
    require(url.isSuccess, "registered Ambari url is invalid")
    //Hit ambari URL
    ws.url(s"${url.get.toString}")
      .withAuth(credentials.user.get,
                credentials.pass.get,
                WSAuthScheme.BASIC)
      .get()
      .map { res =>
        logger.info(s"Successfully connected to Ambari $res")
        if (res.status != 200)
          logger.warn(
            s"Ambari connection works but received a ${res.status} as response" +
              s"This may cause future operations to fail")

        val kerberos =
          if (isClusterKerberized)
            Some(
              Kerberos(cluster.kerberosuser.get,
                       cluster.kerberosticketLocation.get))
          else None

        AmbariConnection(status = true, url.get, kerberos, None)
      }
      .recoverWith {
        case e: Exception =>
          logger.error(s"Could not connect to Ambari, reason: ${e}", e)
          Future.successful(
            AmbariConnection(status = false, url.get, None, Some(e)))
      }

  }

  private def isClusterKerberized = cluster.secured.isDefined && cluster.secured.get

  override def getAtlas: Future[Either[Throwable, Atlas]] = {
    logger.info("Trying to get data from Atlas")

    val serviceSuffix =
      "/configurations/service_config_versions?service_name=ATLAS&is_current=true"
    ws.url(s"${cluster.ambariurl.get}$serviceSuffix")
      .withAuth(credentials.user.get,
                credentials.pass.get,
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
        restService
          .map(url => Right(Atlas(url, Json.stringify(configs))))
          .getOrElse(Left(new MalformedURLException(s"Cannot parse $apiUrl")))

      }
      .recoverWith {
        case e: Exception =>
          logger.error("Cannot get Atlas info")
          Future.successful(Left(e))
      }
  }

  override def getNameNodeStats: Future[Either[Throwable, NameNode]] = {

    val nameNodeResponse = ws
      .url(
        s"${cluster.ambariurl.get}/components/NAMENODE")
      .withAuth(credentials.user.get,
                credentials.pass.get,
                WSAuthScheme.BASIC)
      .get()
    nameNodeResponse
      .map { nnr =>
        val serviceComponent = nnr.json \ "ServiceComponentInfo"
        val startTime = (serviceComponent \ "StartTime")
          .validate[Long]
          .map(l => l)
          .getOrElse(0L)
        val capacityUsed = (serviceComponent \ "CapacityUsed")
          .validate[Long]
          .map(l => l)
          .getOrElse(0L)
        val capacityRemaining = (serviceComponent \ "CapacityRemaining")
          .validate[Long]
          .map(l => l)
          .getOrElse(0L)
        val usedPercentage = (serviceComponent \ "PercentUsed")
          .validate[Double]
          .map(l => l)
          .getOrElse(0.0)
        val totalFiles = (serviceComponent \ "TotalFiles")
          .validate[Long]
          .map(l => l)
          .getOrElse(0L)
        val nameNodeInfo = NameNode(startTime,
                                    capacityUsed,
                                    capacityRemaining,
                                    usedPercentage,
                                    totalFiles,
                                    props = serviceComponent.toOption)
        Right(nameNodeInfo)
      }
      .recoverWith {
        case e: Exception =>
          logger.error("Cannot get Name node info")
          Future.successful(Left(e))
      }
  }

  override def getGetHostInfo: Future[Either[Throwable, Seq[HostInformation]]] = {

    val hostsApi = "/hosts"

    val hostsPath =
      s"${cluster.ambariurl.get}${hostsApi}"

    val hostsResponse: Future[WSResponse] = ws
      .url(hostsPath)
      .withAuth(credentials.user.get,
                credentials.pass.get,
                WSAuthScheme.BASIC)
      .get()
    //Load Cluster Info
    hostsResponse
      .flatMap { hres =>
        val hostsList = (hres.json \ "items" \\ "Hosts").map(
          _.as[JsObject]
            .validate[Map[String, String]]
            .map(m => Some(m))
            .getOrElse(None))
        val listHosts = hostsList.map { hostOpt =>
          val opt: Option[Future[HostInformation]] = hostOpt.map { host =>
            // for each host get host and disk info
            val hostInfoResponse: Future[WSResponse] = ws
              .url(s"${hostsPath}/${host.get("host_name").get}")
              .withAuth(credentials.user.get,
                        credentials.pass.get,
                        WSAuthScheme.BASIC)
              .get()

            val futureHost: Future[HostInformation] = hostInfoResponse.map {
              hir =>
                val hostNode = hir.json \ "Hosts"
                val state = (hostNode \ "host_state")
                  .validate[String]
                  .map(s => s)
                  .getOrElse("")
                val status = (hostNode \ "host_status")
                  .validate[String]
                  .map(s => s)
                  .getOrElse("")
                val ip =
                  (hostNode \ "ip").validate[String].map(s => s).getOrElse("")
                HostInformation(state, s"$status/$state", ip, hostNode.toOption)
            }
            // the host info
            futureHost
          }

          // the optional wrap
          opt
        }
        // get Rid of invalid cases
        val toReturn = listHosts.collect {
          case s: Some[Future[HostInformation]] => s.get
        }

        // Invert the futures
        val sequenced = Future.sequence(toReturn)

        // Build the response
        sequenced.map(Right(_))
      }
      .recoverWith {
        case e: Exception =>
          logger.error("Cannot get host or disk info")
          Future.successful(Left(e))
      }
  }

  override def getKnoxInfo: Future[Either[Throwable, KnoxInfo]] = {
    // Dump knox properties
    val knoxApi =
      s"${cluster.ambariurl.get}/configurations/service_config_versions?service_name=KNOX&is_current=true"
    ws.url(knoxApi)
      .withAuth(credentials.user.get,
                credentials.pass.get,
                WSAuthScheme.BASIC)
      .get()
      .map(
        res =>
          res.json
            .validate[JsValue]
            .map { js =>
              Right(KnoxInfo(Some(js)))
            }
            .getOrElse(Left(new Exception("Could not load Knox properties"))))
      .recoverWith {
        case e: Exception =>
          logger.error("Cannot get Knox information")
          Future.successful(Left(e))
      }

  }


}
