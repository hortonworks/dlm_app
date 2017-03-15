package com.hw.dp.services.atlas

import java.util.concurrent.TimeUnit

import akka.actor.{Actor, ActorRef, ActorSystem, PoisonPill, Props}
import akka.stream.ActorMaterializer
import com.google.common.base.Charsets
import com.google.common.cache.{CacheBuilder, CacheLoader, LoadingCache}
import com.google.common.io.BaseEncoding
import com.hortonworks.dataplane.commons.service.api.{Poll, ServiceException, ServiceNotFound}
import com.hortonworks.dataplane.commons.service.cluster.{Ambari, Cluster}
import com.hw.dp.services.atlas.Hive.{Result, SearchResult}
import org.springframework.http.{HttpEntity, HttpHeaders, HttpMethod}
import org.springframework.security.kerberos.client.KerberosRestTemplate
import org.springframework.web.client.RestTemplate
import play.api.libs.json._
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest, WSResponse}
import play.api.{Configuration, Logger}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.Try

/**
  * A cache backed client for loading hive related data from Atlas
  *
  * Clients should call and wait for the initialize call to complete
  *
  * api.initialize.map { atlas =>
    println(api.fastFindHiveTable("test100"))
    println(api.fastLoadAllTables)
  }.recoverWith {
    case e: Exception => Future.successful(e.printStackTrace())
  }
  *
  * @param actorSystem
  * @param ambari
  * @param cluster
  * @param configuration
  */
class AtlasHiveApiImpl(actorSystem: ActorSystem, ambari: Ambari, cluster: Cluster, configuration: Configuration,ws: WSClient) extends AtlasHiveApi {


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
    * re-initialize the API
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
      tryLoadCache

      tableLoader.map { tl =>
        //initialize the cache
        actorSystem.scheduler.schedule(5 minutes, cacheReloadTime minutes, tl, Poll())
      }
      Atlas(apiUrl)
    }
  }


  private def tryLoadCache = {
    allHiveTables.map(sr =>
      sr.results.map { res =>
        res.foreach { tr =>
          Try(tableCache.put(tr.name.get, tr))
        }
      }
    )
  }

  override def findHiveTable(tableName: String): Try[SearchResult] = {

    val searchUrl = s"${apiUrl}/api/atlas/discovery/search/dsl?query=hive_table where name='${tableName}'"
    Try {
      val entity = new HttpEntity[String](headers);
      val response = template.exchange(searchUrl, HttpMethod.GET, entity, classOf[String])
      Json.parse(response.getBody).validate[SearchResult].map(r => r).getOrElse {
        throw new ServiceException(s"Cannot parse result as Json ${response}")
      }
    }
  }

  override def allHiveTables: Try[SearchResult] = {
    val searchUrl = s"${apiUrl}/api/atlas/discovery/search/dsl?query=hive_table"
    Try {
      val entity = new HttpEntity[String](headers);
      val response = template.exchange(searchUrl, HttpMethod.GET, entity, classOf[String])
      Json.parse(response.getBody).validate[SearchResult].map(r => r).getOrElse {
        throw new ServiceException(s"Cannot parse result as Json ${response}")
      }
    }
  }


  override def fastFindHiveTable(tableName: String): Option[Result] = {
    if(tableCache.size() == 0 ){
      tryLoadCache
    }
    Try(Some(tableCache.get(tableName))) getOrElse None
  }

  /**
    *
    */
  override def close = {
    tableCache.invalidateAll()
    tableLoader.map(_ ! PoisonPill)
  }


  override def cacheWarmed: Boolean = tableCache.size() > 0


  import collection.JavaConverters._

  override def fastLoadAllTables =  {
    if(tableCache.size() == 0 ){
      tryLoadCache
    }
    tableCache.asMap().values().asScala.toSeq
  }

  /**
    * Get raw Entity information
    *
    * @return
    */
  override def getEntity(guid: String): JsValue = {
    val url = s"${apiUrl}/api/atlas/entities/${guid}"
    Try {
      val entity = new HttpEntity[String](headers)
      val response = template.exchange(url, HttpMethod.GET, entity, classOf[String])
      Json.parse(response.getBody)
    } getOrElse(Json.obj())
  }

  private def getResponse(url: String): Future[String] = {
    Future {
      val entity = new HttpEntity[String](headers)
      val response = template.exchange(url, HttpMethod.GET, entity, classOf[String])
      response.getBody
    }
  }

  /**
    * Get Lineage
    *
    * @param guid
    * @return
    */
  override def getLineage(guid: String): Future[Lineage] = {
    val inputsUrl = s"${apiUrl}/api/atlas/lineage/${guid}/inputs/graph"
    val outputsUrl = s"${apiUrl}/api/atlas/lineage/${guid}/outputs/graph"
    val schemaUrl = s"${apiUrl}/api/atlas/lineage/${guid}/schema"
    for{
      inputsResponse <-  getResponse(inputsUrl)
      outputsResponse <-  getResponse(outputsUrl)
      schemaResponse <-  getResponse(schemaUrl)
    } yield {
      Lineage(inputsResponse,outputsResponse,schemaResponse)
    }
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

sealed private class TableCacheLoader(atlasApi: AtlasHiveApi) extends CacheLoader[String, Result] {
  override def load(key: String): Result = {
    Logger.info(s"loading result for table ${key}")
    val hiveTable = atlasApi.findHiveTable(key)
    if (hiveTable.isSuccess) {
      val results = hiveTable.get.results
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


sealed class CacheReloader(atlasApi: AtlasHiveApiImpl) extends Actor {
  override def receive: Receive = {
    case Poll() =>
      Logger.info("Reloading the cache")
      atlasApi.allHiveTables.map(sr =>
        sr.results.foreach { res =>
          res.foreach { tr =>
            Try(atlasApi.tableCache.put(tr.name.get, tr))
          }
        }
      )
  }
}




