package com.hw.dp.services.ranger

import akka.actor.ActorSystem
import com.hw.dp.service.api.{ServiceException, ServiceNotFound}
import com.hw.dp.service.cluster.{Ambari, Cluster}
import org.springframework.http.{HttpEntity, HttpHeaders, HttpMethod, MediaType}
import org.springframework.security.kerberos.client.KerberosRestTemplate
import org.springframework.web.client.RestTemplate
import play.api.{Configuration, Logger}
import play.api.libs.json._
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try


class RangerApiImpl(actorSystem: ActorSystem,
                    ambari: Ambari,
                    cluster: Cluster,
                    configuration: Configuration,
                    ws: WSClient) extends RangerApi {


  val rangerComponent: String = "INFRA_SOLR"
  val rangerService: String = "AMBARI_INFRA"

  val ambariUrlPrefix = s"${ambari.protocol}://${ambari.host}:${ambari.port}/api/v1/clusters/${cluster.name}"
  val componentUrlSuffix = s"/components/$rangerComponent"
  val configUrlSuffix = s"/configurations/service_config_versions?service_name=$rangerService&is_current=true"

  private var template: RestTemplate = _
  private var infraSolrUrlPrefix: String = _
  val headers = new HttpHeaders()
  headers.setContentType(MediaType.TEXT_PLAIN)
  override def initialize: Future[Ranger] = {
    // get host info and solr port
    val configClient: WSRequest = ws.url(s"${ambariUrlPrefix}${configUrlSuffix}").withAuth(ambari.credentials.userName,ambari.credentials.password,WSAuthScheme.BASIC)
    val componentClient: WSRequest = ws.url(s"${ambariUrlPrefix}${componentUrlSuffix}").withAuth(ambari.credentials.userName,ambari.credentials.password,WSAuthScheme.BASIC)

    for {
      configResponse <- configClient.get()
      componentResponse <- componentClient.get()
    } yield {
      val cr = configResponse.json
      val configurations = cr \ "items" \\ "configurations"
      val configs: JsValue = configurations.head
      val configsAsList = configs.as[List[JsObject]]
      val solrConfig = configsAsList.find(obj => (obj \ "type").as[String] == "infra-solr-env")
      if (solrConfig.isEmpty)
        throw ServiceNotFound("No properties found for Infra Solr")
      val properties = (solrConfig.get \ "properties").as[JsObject]
      val compRes = componentResponse.json
      val hostRoles = compRes \ "host_components" \\ "HostRoles"
      val hosts = hostRoles.map { hr =>
        (hr \ "host_name").as[String]
      }
      //pick the first host
      val host = hosts.head
      val port = (properties \ "infra_solr_port").as[String]
      infraSolrUrlPrefix = s"http://$host:$port/solr/ranger_audits/select?"
      // No good way of checking if Solr is KDB enabled, check ambari
      val isKerberos = ambari.credentials.kerberos.isDefined
      if (isKerberos) {
        Logger.info("using Kerberos as Ambari indicates that its enabled")
        ambari.credentials.kerberos.map { _ =>
          template = new KerberosRestTemplate(ambari.credentials.kerberos.get.keyTab,
            ambari.credentials.kerberos.get.principal)
        }.getOrElse {
          throw ServiceException(s"Kerberos detected for Solr, but not configured on data-plane cluster ${ambari.host}")
        }
      } else {
        template = new RestTemplate()

      }
      Ranger(infraSolrUrlPrefix)
    }

  }

  override def getTopUsers: Future[JsValue] = {
    makeGetRequest(configuration.underlying.getString("solr.top.users.query"))
  }

  import scala.concurrent.duration._
  private def makeGetRequest(path:String) = {
    val url = s"${infraSolrUrlPrefix}$path"
    ws.url(url).withRequestTimeout(30 seconds).get().map{ res =>
      res.json
    }
  }

  override def getRangerAuditLogs: Future[JsValue] = {
    makeGetRequest(configuration.underlying.getString("solr.audit.log.query"))
  }

  override def getTopAccessTypes: Future[JsValue] = {
    makeGetRequest(configuration.underlying.getString("solr.access.types.query"))
  }
}
