package com.hw.dp.services.atlas

import akka.actor.{ActorRef, ActorSystem, Props}
import akka.stream.ActorMaterializer
import com.hw.dp.service.api.{ServiceActor, ServiceException, ServiceNotFound, Snapshot}
import com.hw.dp.service.cluster.{Ambari, Credentials, ServiceComponent}
import org.asynchttpclient.{DefaultAsyncHttpClientConfig, Realm}
import org.springframework.http.HttpMethod
import org.springframework.security.kerberos.client.KerberosRestTemplate
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSAuthScheme, WSRequest, WSResponse}
import play.api.libs.ws.ahc.{AhcConfigBuilder, AhcWSClient, AhcWSClientConfig}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class WebHcatService(ambari: Ambari, service: ServiceComponent, persister: Option[ActorRef]) {

  val ambariUrlPrefix = s"${ambari.protocol}://${ambari.host}:${ambari.port}/api/v1/clusters/${service.clusterName}"
  val configUrlSuffix = "/configurations/service_config_versions?service_name=HIVE&is_current=true"

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  val client: WSRequest = AhcWSClient().url(s"${ambariUrlPrefix}${configUrlSuffix}")

  //create fetchers
  val collector = system.actorOf(Props(classOf[Collector]))
  val tr = system.actorOf(Props(classOf[TableRouter],collector))
  val dbRouter = system.actorOf(Props(classOf[DbRouter],tr))

  def fetchData(service: ServiceComponent,
                onComplete: (Option[Snapshot]) => Unit) = {

    //first get all service config versions
    val configResponse: Future[WSResponse] = client.withAuth(ambari.credentials.userName,
      ambari.credentials.password, WSAuthScheme.BASIC).get()

    configResponse.map { res =>
      val json = res.json
      val configurations = json \ "items" \\ "configurations"
      val configs: JsValue = configurations(0)
      val configsAsList = configs.as[List[JsObject]]
      val webhcatConfig = configsAsList.find(obj => (obj \ "type").as[String] == "webhcat-site")
      if (!webhcatConfig.isDefined)
        throw new ServiceNotFound("no Webhcat config found")
      val properties = (webhcatConfig.get \ "properties").as[JsObject]
      val webhcatPort = (properties \ "templeton.port").as[String]
      val webHcatKeyTab = (properties \ "templeton.kerberos.keytab").asOpt[String]
      val webHcatPrincipal = (properties \ "templeton.kerberos.principal").asOpt[String]
      val webHcatSecret = (properties \ "templeton.kerberos.secret").asOpt[String]

      val host = service.hosts(0)
      val webhCatUrl = "http://c6401.ambari.apache.org:21000/api/atlas/types"

      val keytabLocation = "/Users/arajeev/IdeaProjects/ambari/dataplane.server.keytab"
      val principal = "dataplane@EXAMPLE.COM"

      val template = new KerberosRestTemplate(keytabLocation, principal)
      // start fetching information from Hcatalog

      val dbs = template.getForObject(webhCatUrl,classOf[String])
      println(dbs)
//      val jsValue = Json.parse(dbs)
//      val databases = (jsValue \ "databases").as[List[String]]
//      databases.foreach { it =>
//        dbRouter ! GetDb(Database(it),webhCatUrl,template)
//      }

    }.recoverWith {
      case e:Exception => Future.successful(e.printStackTrace())
    }


  }


}


object Runner extends App {
  new WebHcatService(Ambari("http", "c6401.ambari.apache.org", 8080, Credentials("admin", "admin", None), "testdc")
    , ServiceComponent("", "", "test", "c6401.ambari.apache.org", ""), None).fetchData(ServiceComponent("", "", "test", "c6401.ambari.apache.org", "",Seq("c6402.ambari.apache.org")), { l => })
}