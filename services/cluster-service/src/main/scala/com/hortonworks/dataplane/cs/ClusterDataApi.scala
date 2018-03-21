/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.cs

import java.net.URL
import java.util.concurrent.{Executors, TimeUnit}

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.google.common.base.{Supplier}
import com.google.common.cache.{Cache, CacheBuilder, CacheLoader, LoadingCache}
import com.google.inject.Inject
import com.hortonworks.dataplane.CSConstants
import com.hortonworks.dataplane.commons.domain.{Constants, Entities}
import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneCluster, HJwtToken, ClusterService => CS}
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.hortonworks.dataplane.cs.tls.SslContextManager
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService, ClusterService, DpClusterService}
import com.hortonworks.dataplane.knox.Knox.{KnoxConfig, TokenResponse}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.joda.time.DateTime
import play.api.libs.json.{JsArray, JsObject, JsValue}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try


class ClusterDataApi @Inject()(
    private val actorSystem: ActorSystem,
    private val actorMaterializer: ActorMaterializer,
    private val credentialInterface: CredentialInterface,
    private val clusterComponentService: ClusterComponentService,
    private val clusterHostsService: ClusterHostsService,
    private val dpClusterService: DpClusterService,
    private val clusterService: ClusterService,
    private val sslContextManager: SslContextManager,
    private val config: Config) {

  //Create a new Execution context for use in our proxy
  private implicit val ec =
    ExecutionContext.fromExecutor(Executors.newWorkStealingPool())

  // The time for which the cluster-supplier mapping should be help in memory
  private val cacheExpiry =
    Try(config.getInt("dp.services.cluster.atlas.proxy.cache.expiry.secs"))
      .getOrElse(600)

  private val tokenCacheExpiry =
    Try(config.getInt("dp.services.cluster.knox.token.cache.expiry.secs"))
      .getOrElse(3600)

  private val tokenExpiryTime =
    Try(config.getInt("dp.services.cluster.knox.token.cache.removal.time"))
      .getOrElse(3)

  private lazy val log = Logger(classOf[ClusterDataApi])


  log.info(s"Constructing a cache with expiry $cacheExpiry secs")

  // Do not remove the cast or the compiler will throw up
  private val clusterAtlasSupplierCache = CacheBuilder
    .newBuilder()
    .expireAfterAccess(cacheExpiry, TimeUnit.SECONDS)
    .build(
      new URLSupplierCacheLoader(clusterComponentService,
                                 clusterHostsService)).asInstanceOf[LoadingCache[Long,Supplier[Future[Set[URL]]]]]


  private case class CacheKey(cluster:Long,token:String)

  private val tokenCache: Cache[CacheKey, TokenResponse] = CacheBuilder
    .newBuilder()
    .expireAfterWrite(tokenCacheExpiry, TimeUnit.SECONDS)
    .build()
    .asInstanceOf[Cache[CacheKey, TokenResponse]]

  implicit val materializer = actorMaterializer

  def validToken(tr: TokenResponse): Boolean = {
    val expiry = new DateTime(tr.expires)
      .minusSeconds(tokenExpiryTime)
      .toInstant
      .getMillis
    new DateTime().toInstant.getMillis <= expiry
  }

  def getCredentials: Future[Credentials] = credentialInterface.getCredential(CSConstants.ATLAS_CREDENTIAL_KEY)

  def shouldUseToken(clusterId:Long):Future[Boolean] =  {

    for{
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
    } yield dpc.knoxEnabled.isDefined && dpc.knoxEnabled.get && dpc.knoxUrl.isDefined

  }

  def getTokenForCluster(
      clusterId: Long,
      inputToken: Option[HJwtToken]): Future[Option[String]] = {

    for {
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)

      newToken <- Future.successful({ t: String =>
       val executor =  KnoxApiExecutor(
          KnoxConfig(Try(config.getString("dp.services.knox.token.topology"))
            .getOrElse("token"),
            dpc.knoxUrl),
         sslContextManager.getWSClient(dpc.allowUntrusted))

        executor.getKnoxApiToken(s"${Constants.HJWT}=$t")
      })

      token <- {
        if (inputToken.isDefined && dpc.knoxEnabled.isDefined && dpc.knoxEnabled.get && dpc.knoxUrl.isDefined) {
          val decodedToken = inputToken.get.token
          // Build cookie header
          log.info("Building cookie for Knox call")
          val accessToken = tokenCache.getIfPresent(CacheKey(clusterId,decodedToken))
          val optionalToken = Option(accessToken)
          if (optionalToken.isDefined && validToken(optionalToken.get)) {
            log.info("Token in cache and not expired, reusing...")
            Future.successful(Some(optionalToken.get.accessToken))
          } else {
            // token not in cache or expired
            // remove token from cache
            tokenCache.invalidate(CacheKey(clusterId,decodedToken))
            newToken(decodedToken).map { t =>
              // add new token to cache
              log.info(
                "No token in cache, Loaded from knox and added to cache")
              tokenCache.put(CacheKey(clusterId,decodedToken), t)
              Some(t.accessToken)
            }
          }
        } else {
          Future.successful(None)
        }
      }
    } yield token
  }

  def getAtlasUrl(clusterId:Long): Future[Set[String]] = {
     val atlasUrl =
       clusterAtlasSupplierCache
         .get(clusterId)
         .get()
         .map(
           _.map(_.toString)
         )

    // Make sure We evict on failure
    atlasUrl.onFailure {
      case th:Throwable =>
        log.error("Cannot load Atlas Url",th)
        log.info(s"Invalidating any entries for cluster id -  ${clusterId}")
        clusterAtlasSupplierCache.invalidate(clusterId)
    }
    atlasUrl
  }


  private def getKnoxUrl(dpc: Entities.DataplaneCluster, cs: CS) = {
    val topology = config.getString("dp.services.knox.token.target.topology")

    cs.properties match {
      case Some(json) => {
        val item = (json \ "items").as[JsArray].head
        val target = (item \ "configurations").as[List[JsValue]].find(v => (v \ "type").as[String] == "gateway-site")
        val gatewayPath = (target.get \ "properties" \ "gateway.path").as[String]

        // FIXME: We do not append gateway path if it is already saved in knoxUrl
        var urlWithoutSuffix = dpc.knoxUrl.get.stripSuffix("/")
        if (!urlWithoutSuffix.endsWith(gatewayPath)) {
          urlWithoutSuffix = s"$urlWithoutSuffix/$gatewayPath"
        }

        Some(s"$urlWithoutSuffix/$topology")
      }
      case None => None
    }
  }

  def getKnoxUrl(clusterId:Long):Future[Option[String]] = {
    for{
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
      service <- clusterComponentService.getServiceByName(clusterId, Constants.KNOX)
      cs <- Future.successful(service.right.get)
    } yield getKnoxUrl(dpc,cs)
  }


  def getAmbariUrl(clusterId:Long):Future[String] = {
    for {
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
    } yield dpc.ambariUrl
  }

  def getDataplaneCluster(clusterId: Long): Future[DataplaneCluster] = {
    for{
      cl <- clusterService.retrieve(clusterId.toString)
      c <- Future.successful(cl.right.get)
      dpce <- dpClusterService.retrieve(c.dataplaneClusterId.get.toString)
      dpc <- Future.successful(dpce.right.get)
    } yield dpc
  }

}




private sealed class AtlasURLSupplier(
    clusterId: Long,
    clusterComponentService: ClusterComponentService,
    clusterHostsService: ClusterHostsService)(implicit ec: ExecutionContext)
    extends Supplier[Future[Set[URL]]] {

  private lazy val log = Logger(classOf[AtlasURLSupplier])

  def getAtlasUrlFromConfig(service: CS): Future[Set[URL]] = Future.successful {

    val configsAsList =
      (service.properties.get \ "properties").as[List[JsObject]]
    val atlasConfig = configsAsList.find(obj =>
      (obj \ "type").as[String] == "application-properties")
    if (atlasConfig.isEmpty)
      throw ServiceNotFound("No properties found for Atlas")
    val properties = (atlasConfig.get \ "properties").as[JsObject]
    val apiUrl = (properties \ "atlas.rest.address").as[String]
    val urlList = apiUrl.split(",").map(_.trim)
    urlList.map(new URL(_)).toSet
  }

  override def get(): Future[Set[URL]] = {

    log.info("Fetching the Atlas URL from storage")
    val f = for {
      service <- getUrlOrThrowException(clusterId)
      url <- getAtlasUrlFromConfig(service)
      atlasUrl <- extractUrl(url, clusterId)
    } yield atlasUrl

    // Its important to complete this future before caching it
    for {
      intF <- f
      url <- Future.successful(intF)
    } yield url
  }

  private def getUrlOrThrowException(clusterId: Long) = {
    clusterComponentService
      .getServiceByName(clusterId, Constants.ATLAS)
      .map {
        case Right(endpoints) => endpoints
        case Left(errors) =>
          throw new Exception(errors.firstMessage.toString)
      }
  }

  def extractUrl(service: Set[URL], clusterId: Long): Future[Set[URL]] = {

    val services = service.map( s =>
    clusterHostsService
      .getHostByClusterAndName(clusterId, s.getHost)
      .map {
        case Right(host) =>
          new URL(
            s"${s.getProtocol}://${host.ipaddr}:${s.getPort}")
        case Left(errors) =>
          throw new Exception(
            s"Cannot translate the atlas hostname ${s.getHost} into an IP address $errors")
      })

    Future.sequence(services)
  }

}

sealed class URLSupplierCacheLoader(
    private val clusterComponentService: ClusterComponentService,
    private val clusterHostsService: ClusterHostsService)(implicit ec: ExecutionContext)
    extends CacheLoader[Long, Supplier[Future[Set[URL]]]]() {

  private lazy val log = Logger(classOf[URLSupplierCacheLoader])

  override def load(key: Long): Supplier[Future[Set[URL]]] = {
    log.info(
      s"Loading a URL supplier into cache, URL's for cluster-id:$key")
      new AtlasURLSupplier(key, clusterComponentService, clusterHostsService)

  }
}
