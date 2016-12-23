package com.hw.dp.services.hbase

import java.util.concurrent.TimeUnit

import akka.actor.{Actor, ActorRef, ActorSystem, PoisonPill, Props}
import akka.stream.ActorMaterializer
import com.google.common.base.Charsets
import com.google.common.cache.{CacheBuilder, CacheLoader, LoadingCache}
import com.google.common.io.BaseEncoding
import com.hw.dp.service.api.{Poll, ServiceException, ServiceNotFound}
import com.hw.dp.service.cluster.{Ambari, Cluster}
import com.hw.dp.services.atlas.Atlas
import org.springframework.http.{HttpEntity, HttpHeaders, HttpMethod}
import org.springframework.security.kerberos.client.KerberosRestTemplate
import org.springframework.web.client.RestTemplate
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest, WSResponse}
import play.api.{Configuration, Logger}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import HBase._
import scala.util.Try

/**
  * A cache backed client for loading hbase related data from Atlas
  *
  * Clients should call and wait for the initialize call to complete
  *
  * api.initialize.map { atlas =>
  * println(api.fastFindhbaseTable("test100"))
  * println(api.fastLoadAllTables)
  * }.recoverWith {
  * case e: Exception => Future.successful(e.printStackTrace())
  * }
  *
  * @param actorSystem
  * @param ambari
  * @param cluster
  * @param configuration
  */
class AtlasHBaseApiImpl(actorSystem: ActorSystem, ambari: Ambari, cluster: Cluster, configuration: Configuration,ws: WSClient) extends AtlasHBaseApi {


  val ambariUrlPrefix = s"${ambari.protocol}://${ambari.host}:${ambari.port}/api/v1/clusters/${cluster.name}"
  val configUrlSuffix = "/configurations/service_config_versions?service_name=ATLAS&is_current=true"

  implicit val system = actorSystem
  implicit val materializer = ActorMaterializer()
  val client: WSRequest = ws.url(s"${ambariUrlPrefix}${configUrlSuffix}")

  private var apiUrl: String = _
  private var template: RestTemplate = _
  private var tableLoader: Option[ActorRef] = None
  private val cacheReloadTime: Int = Try(configuration.underlying.getInt("atlas.api.tableCache.reload.minutes")) getOrElse (15)
  val headers = new HttpHeaders()

  /**
    * The initialze call sets up a table cache, which allows for faster entity look ups, should cache tables
    *
    */
  val tableCache: LoadingCache[String, Result] = CacheBuilder.newBuilder()
    .maximumSize(Try(configuration.underlying.getLong("atlas.api.tableCache.limit")) getOrElse (10000L))
    .expireAfterWrite(Try(configuration.underlying.getLong("atlas.api.tableCache.time.minutes")) getOrElse (60), TimeUnit.MINUTES)
    .build(new TableCacheLoader(this))

  /**
    * Initialize the API
    */
  override def initialize: Future[Atlas] = {
    Logger.info("Starting atlas API")
    val configResponse: Future[WSResponse] = client.withAuth(ambari.credentials.userName,
      ambari.credentials.password, WSAuthScheme.BASIC).get()
    configResponse.map { res =>
      val json = res.json
      val configurations = json \ "items" \\ "configurations"
      val configs: JsValue = configurations.head
      val configsAsList = configs.as[List[JsObject]]
      val atlasConfig = configsAsList.find(obj => (obj \ "type").as[String] == "application-properties")
      if (!atlasConfig.isDefined)
        throw new ServiceNotFound("No properties found for Atlas")
      val properties = (atlasConfig.get \ "properties").as[JsObject]
      apiUrl = (properties \ "atlas.rest.address").as[String]

      val isKerberos = (properties \ "atlas.authentication.method.kerberos").as[String]
      if (isKerberos == "true") {
        Logger.info("using kerberos as Atlas needs it")
        ambari.credentials.kerberos.map { _ =>
          template = new KerberosRestTemplate(ambari.credentials.kerberos.get.keyTab,
            ambari.credentials.kerberos.get.principal)
        }.getOrElse {
          throw new ServiceException(s"Kerberos detected for atlas, but not configured on dataplane cluster ${ambari.host}")
        }
      } else {
        template = new RestTemplate()

        val pass =  BaseEncoding.base64()
          .encode("admin:admin".getBytes(Charsets.UTF_8))
        headers.set("Authorization", "Basic "+pass)
      }
      // load all tables into the cache
      //clean up the cache
      Logger.info("invalidating caches")
      tableCache.invalidateAll()
      // if there is a loader running , kill it
      tableLoader.map(_ ! PoisonPill)

      tableLoader = Some(actorSystem.actorOf(Props(classOf[CacheReloader], this)))

      // preload cache
      allHBaseTables.map(sr =>
        sr.results.foreach { res =>
          res.foreach { tr =>
            Try(tableCache.put(tr.name.get, tr))
          }
        }
      )

      tableLoader.map { tl =>
        //initialize the cache
        actorSystem.scheduler.schedule(5 minutes, cacheReloadTime minutes, tl, Poll())
      }
      Atlas(apiUrl)
    }

  }

  /**
    * clear caches and shutdown the API connection
    */
  override def close: Unit = {
    tableCache.invalidateAll()
    tableLoader.map(_ ! PoisonPill)
  }

  /**
    * Clients can call this method to check the availability of the cache
    *
    * @return True if cache ready
    */
  override def cacheWarmed: Boolean = tableCache.size() > 0

  /**
    * Look up a hbase table using the Atlas API
    *
    * @param tableName
    * @return search result
    */
  override def findHBaseTable(tableName: String): Try[PhoenixSearchResult] = {
    val searchUrl = s"${apiUrl}/api/atlas/discovery/search/dsl?query=PhoenixTable where name='${tableName}'"
    Try {
      val entity = new HttpEntity[String](headers)
      val response = template.exchange(searchUrl, HttpMethod.GET, entity, classOf[String])
      Json.parse(response.getBody).validate[PhoenixSearchResult].map(r => r).getOrElse {
        throw new ServiceException(s"Cannot parse result as Json ${response}")
      }
    }

  }

  /**
    * Load all hbase tables
    *
    * @return Search result
    */
  override def allHBaseTables: Try[PhoenixSearchResult] = {
    val searchUrl = s"${apiUrl}/api/atlas/discovery/search/dsl?query=PhoenixTable"
    Try {
      val entity = new HttpEntity[String](headers)
      val response = template.exchange(searchUrl, HttpMethod.GET, entity, classOf[String])
      Json.parse(response.getBody).validate[PhoenixSearchResult].map(r => r).getOrElse {
        throw new ServiceException(s"Cannot parse result as Json ${response}")
      }
    }

  }

  /**
    * A quicker version of the table lookup which relies on the underlying
    * cache for getting the table information, clients should try to load
    * table information using this method first.
    *
    * @param tableName
    * @return
    */
  override def fastFindHBaseTable(tableName: String): Option[Result] = {
    Try(Some(tableCache.get(tableName))) getOrElse None
  }

  /**
    * Load all tables from the cache
    *
    * @return
    */
  import collection.JavaConverters._
  override def fastLoadAllTables: Seq[Result] =  tableCache.asMap().values().asScala.toSeq


  override def getEntity(guid: String): JsValue = {
    val url = s"${apiUrl}/api/atlas/entities/${guid}"
    Try {
      val entity = new HttpEntity[String](headers)
      val response = template.exchange(url, HttpMethod.GET, entity, classOf[String])
      Json.parse(response.getBody)
    } getOrElse(Json.obj())
  }

  /**
    * Get Audit information
    *
    * @param guid
    * @return
    */
  override def getAudit(guid: String): JsValue = {
    val url = s"${apiUrl}/api/atlas/entities/${guid}/audit"
    Try {
      val entity = new HttpEntity[String](headers)
      val response = template.exchange(url, HttpMethod.GET, entity, classOf[String])
      Json.parse(response.getBody)
    } getOrElse(Json.obj())
  }
}


sealed private class TableCacheLoader(atlasApi: AtlasHBaseApi) extends CacheLoader[String, Result] {
  override def load(key: String): Result = {
    Logger.info(s"loading result for table ${key}")
    val hbaseTable = atlasApi.findHBaseTable(key)
    if (hbaseTable.isSuccess) {
      val results = hbaseTable.get.results
      if (results.isDefined) {
        // check if there is one result
        if (results.get.size > 0) {
          return results.get(0)
        }
      }
    }
    throw new Exception(s"Cannot load tab data for key ${key}")
  }

}


sealed class CacheReloader(atlasApi: AtlasHBaseApiImpl) extends Actor {
  override def receive: Receive = {
    case Poll() =>
      Logger.info("Reloading the cache")
      atlasApi.allHBaseTables.map(sr =>
        sr.results.foreach { res =>
          res.foreach { tr =>
            Try(atlasApi.tableCache.put(tr.name.get, tr))
          }
        }
      )
  }
}




