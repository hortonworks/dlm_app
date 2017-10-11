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

import javax.inject.Named

import akka.actor.ActorSystem
import akka.http.scaladsl.{Http, HttpsConnectionContext}
import akka.stream.ActorMaterializer
import com.google.inject.{AbstractModule, Provider, Provides, Singleton}
import com.hortonworks.dataplane.cs.sync.DpClusterSync
import com.hortonworks.dataplane.cs.utils.SSLUtils.DPTrustStore
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService, ClusterService, ConfigService, DpClusterService}
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.http.routes.{DpProfilerRoute, _}
import com.hortonworks.dataplane.http.{ProxyServer, Webserver}
import com.typesafe.config.{Config, ConfigFactory}
import com.typesafe.sslconfig.akka.AkkaSSLConfig
import com.typesafe.sslconfig.ssl.{TrustManagerConfig, TrustStoreConfig}
import org.asynchttpclient.DefaultAsyncHttpClientConfig
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSClient

import scala.util.Try

object AppModule extends AbstractModule {

  override def configure() = {
    bind(classOf[DPTrustStore]).asEagerSingleton()
    bind(classOf[Config]).toInstance(ConfigFactory.load())
    bind(classOf[ActorSystem]).toInstance(ActorSystem("cluster-service"))

  }

  @Provides
  @Named("connectionContext")
  def provideSSLConfig(implicit actorSystem: ActorSystem,
                       materializer: ActorMaterializer,
                       config: Config,
                       dPKeystore: DPTrustStore): HttpsConnectionContext = {
    // provides a custom ssl config with the dp keystore
    val c = AkkaSSLConfig().mapSettings { s =>
      val settings = s
        .withDisabledKeyAlgorithms(
          scala.collection.immutable.Seq("RSA keySize < 1024"))
        .withTrustManagerConfig(
          TrustManagerConfig().withTrustStoreConfigs(
            scala.collection.immutable.Seq(
              TrustStoreConfig(None, Some(dPKeystore.getKeyStoreFilePath)))))
      if (config.getBoolean(
            "dp.services.ssl.config.disable.hostname.verification"))
        settings.withLoose(s.loose.withDisableHostnameVerification(true))
      else
        settings
    }
    val dpCtx = Http().createClientHttpsContext(c)
    dpCtx
  }

  @Provides
  @Singleton
  def provideMaterializer(
      implicit actorSystem: ActorSystem): ActorMaterializer = {
    ActorMaterializer()
  }

  @Provides
  @Singleton
  def provideWsClient(implicit actorSystem: ActorSystem,
                      materializer: ActorMaterializer,
                      configuration: Config): WSClient = {
    val config = new DefaultAsyncHttpClientConfig.Builder()
      .setAcceptAnyCertificate(true)
      .setRequestTimeout(Try(configuration.getInt(
        "dp.services.ws.client.requestTimeout.mins") * 60 * 1000)
        .getOrElse(4 * 60 * 1000))
      .build
    AhcWSClient(config)
  }

  @Provides
  @Singleton
  def provideDpClusterService(implicit ws: WSClient,
                              configuration: Config): DpClusterService = {

    new DpClusterServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideClusterDataService(
      implicit ws: WSClient,
      configuration: Config): ClusterComponentService = {
    new ClusterComponentServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideClusterService(implicit ws: WSClient,
                            configuration: Config): ClusterService = {
    new ClusterServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideConfigService(implicit ws: WSClient,
                           configuration: Config): ConfigService = {
    new ConfigServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideClusterHostsService(
      implicit ws: WSClient,
      configuration: Config): ClusterHostsService = {
    new ClusterHostsServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideAtlasApiData(actorSystem: ActorSystem,
                          materializer: ActorMaterializer,
                          credentialInterface: CredentialInterface,
                          clusterComponentService: ClusterComponentService,
                          clusterHostsService: ClusterHostsService,
                          dpClusterService: DpClusterService,
                          clusterService: ClusterService,
                          wSClient: WSClient,
                          config: Config): ClusterDataApi = {
    new ClusterDataApi(actorSystem,
                       materializer,
                       credentialInterface,
                       clusterComponentService,
                       clusterHostsService,
                       dpClusterService,
                       clusterService,
                       wSClient,
                       config)
  }

  @Provides
  @Singleton
  def provideAtlasRoute(
      config: Config,
      atlasApiData: ClusterDataApi,
      credentialInterface: CredentialInterface): AtlasRoute = {
    AtlasRoute(config, atlasApiData, credentialInterface)
  }

  @Provides
  @Singleton
  def provideStatusRoute(storageInterface: StorageInterface,
                         credentialInterface: CredentialInterface,
                         config: Config,
                         wSClient: WSClient,
                         clusterSync: ClusterSync,
                         dpClusterSync: DpClusterSync): StatusRoute = {
    new StatusRoute(wSClient,
                    storageInterface,
                    credentialInterface,
                    config,
                    clusterSync,
                    dpClusterSync)
  }

  @Provides
  @Singleton
  def provideAmbariRoute(storageInterface: StorageInterface,
                         credentialInterface: CredentialInterface,
                         config: Config,
                         clusterService: ClusterService,
                         dpClusterService: DpClusterService,
                         wSClient: WSClient): AmbariRoute = {
    new AmbariRoute(wSClient,
                    storageInterface,
                    clusterService,
                    credentialInterface,
                    dpClusterService,
                    config)
  }
  @Provides
  @Singleton
  def provideHdpProxyRoute(
      actorSystem: ActorSystem,
      actorMaterializer: ActorMaterializer,
      clusterData: ClusterDataApi,
      config: Config,
      @Named("connectionContext") sslContext: Provider[HttpsConnectionContext],
      dPKeystore: DPTrustStore): HdpRoute = {
    new HdpRoute(actorSystem,
                 actorMaterializer,
                 clusterData,
                 sslContext,
                 config,
                 dPKeystore)
  }

  @Provides
  @Singleton
  def provideHdpProxyServer(actorSystem: ActorSystem,
                            materializer: ActorMaterializer,
                            config: Config,
                            hdpRoute: HdpRoute): ProxyServer = {
    new ProxyServer(actorSystem, materializer, config, hdpRoute.proxy)
  }

  @Provides
  @Singleton
  def provideRangerRoute(storageInterface: StorageInterface,
                         credentialInterface: CredentialInterface,
                         clusterComponentService: ClusterComponentService,
                         clusterHostsService: ClusterHostsService,
                         wSClient: WSClient): DpProfilerRoute = {
    new DpProfilerRoute(clusterComponentService,
                        clusterHostsService,
                        storageInterface,
                        wSClient)
  }

  @Provides
  @Singleton
  def provideDpProfilerRoute(storageInterface: StorageInterface,
                             credentialInterface: CredentialInterface,
                             clusterComponentService: ClusterComponentService,
                             clusterHostsService: ClusterHostsService,
                             dpClusterService: DpClusterService,
                             clusterService: ClusterService,
                             config: Config,
                             wSClient: WSClient): RangerRoute = {
    new RangerRoute(clusterComponentService,
                    clusterHostsService,
                    storageInterface,
                    credentialInterface,
                    dpClusterService,
                    clusterService,
                    config,
                    wSClient)
  }

  @Provides
  @Singleton
  def provideWebservice(actorSystem: ActorSystem,
                        materializer: ActorMaterializer,
                        configuration: Config,
                        atlasRoute: AtlasRoute,
                        rangerRoute: RangerRoute,
                        dpProfilerRoute: DpProfilerRoute,
                        statusRoute: StatusRoute,
                        ambariRoute: AmbariRoute): Webserver = {
    import akka.http.scaladsl.server.Directives._
    new Webserver(
      actorSystem,
      materializer,
      configuration,
      rangerRoute.rangerAudit ~
        rangerRoute.rangerPolicy ~
        dpProfilerRoute.startJob ~
        dpProfilerRoute.jobStatus ~
        dpProfilerRoute.jobDelete ~
        dpProfilerRoute.startAndScheduleJob ~
        dpProfilerRoute.scheduleInfo ~
        dpProfilerRoute.auditResults ~
        dpProfilerRoute.auditActions ~
        atlasRoute.hiveAttributes ~
        atlasRoute.hiveTables ~
        atlasRoute.atlasEntities ~
        atlasRoute.atlasEntity ~
        atlasRoute.atlasLineage ~
        atlasRoute.atlasTypeDefs ~
        statusRoute.route ~
        statusRoute.sync ~
        statusRoute.health ~
        ambariRoute.route ~
        ambariRoute.ambariClusterProxy ~
        ambariRoute.ambariGenericProxy
    )
  }

  @Provides
  @Singleton
  def provideStorageInterface(
      dpClusterService: DpClusterService,
      clusterService: ClusterService,
      clusterComponentService: ClusterComponentService,
      clusterHostsServiceImpl: ClusterHostsService,
      configService: ConfigService): StorageInterface = {
    new StorageInterfaceImpl(clusterService,
                             dpClusterService,
                             clusterComponentService,
                             clusterHostsServiceImpl,
                             configService)
  }

  @Provides
  @Singleton
  def provideCredentialInterface(config: Config): CredentialInterface = {
    new CredentialInterfaceImpl(config)
  }

  @Provides
  @Singleton
  def provideClusterSync(actorSystem: ActorSystem,
                         config: Config,
                         clusterInterface: StorageInterface,
                         wSClient: WSClient): ClusterSync = {
    new ClusterSync(actorSystem, config, clusterInterface, wSClient)
  }

  @Provides
  @Singleton
  def provideDpClusterSync(actorSystem: ActorSystem,
                           config: Config,
                           clusterInterface: StorageInterface,
                           credentialInterface: CredentialInterface,
                           dpClusterService: DpClusterService,
                           wSClient: WSClient): DpClusterSync = {
    new DpClusterSync(actorSystem,
                      config,
                      clusterInterface,
                      credentialInterface,
                      dpClusterService,
                      wSClient)
  }

}
