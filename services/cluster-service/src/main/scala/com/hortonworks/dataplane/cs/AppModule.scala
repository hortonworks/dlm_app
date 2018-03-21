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

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.commons.metrics.MetricsRegistry
import com.hortonworks.dataplane.cs.atlas.{AtlasApiSupplier, AtlasService}
import com.hortonworks.dataplane.cs.sync.DpClusterSync
import com.hortonworks.dataplane.cs.tls.SslContextManager
import com.hortonworks.dataplane.db.Webservice.{CertificateService, ClusterComponentService, ClusterHostsService, ClusterService, ConfigService, DpClusterService}
import com.hortonworks.dataplane.db.{CertificateServiceImpl, _}
import com.hortonworks.dataplane.http.routes.{DpProfilerRoute, _}
import com.hortonworks.dataplane.http.{ProxyServer, Webserver}
import com.typesafe.config.{Config, ConfigFactory}
import org.asynchttpclient.DefaultAsyncHttpClientConfig
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSClient

import scala.util.Try

object AppModule extends AbstractModule {

  override def configure() = {
    bind(classOf[Config]).toInstance(ConfigFactory.load())
    bind(classOf[ActorSystem]).toInstance(ActorSystem("cluster-service"))
    bind(classOf[MetricsRegistry])
      .toInstance(MetricsRegistry("cluster-service"))
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
  def provideClusterHostsService(implicit ws: WSClient,
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
                          sslContextManager: SslContextManager,
                          config: Config): ClusterDataApi = {
    new ClusterDataApi(actorSystem,
                       materializer,
                       credentialInterface,
                       clusterComponentService,
                       clusterHostsService,
                       dpClusterService,
                       clusterService,
                       sslContextManager,
                       config)
  }

  @Provides
  @Singleton
  def provideAtlasService(ws: WSClient, config: Config): AtlasService = {

    implicit val knoxProxyWsClient: KnoxProxyWsClient = KnoxProxyWsClient(ws, config)
    new AtlasService(config)
  }

  @Provides
  @Singleton
  def provideAtlasRoute(config: Config, atlasService: AtlasService, clusterDataApi: ClusterDataApi, credentialInterface: CredentialInterface): AtlasRoute = {
    new AtlasRoute(config, atlasService, clusterDataApi, credentialInterface)
  }

  @Provides
  @Singleton
  def provideStatusRoute(storageInterface: StorageInterface,
                         credentialInterface: CredentialInterface,
                         config: Config,
                         clusterSync: ClusterSync,
                         dpClusterSync: DpClusterSync,
                         metricsRegistry: MetricsRegistry,
                         sslContextManager: SslContextManager): StatusRoute = {
    new StatusRoute(storageInterface,
                    credentialInterface,
                    config,
                    clusterSync,
                    dpClusterSync,
                    metricsRegistry,
                    sslContextManager)
  }

  @Provides
  @Singleton
  def provideAmbariRoute(storageInterface: StorageInterface,
                         credentialInterface: CredentialInterface,
                         config: Config,
                         clusterService: ClusterService,
                         dpClusterService: DpClusterService,
                         sslContextManager: SslContextManager): AmbariRoute = {
    new AmbariRoute(storageInterface,
                    clusterService,
                    credentialInterface,
                    dpClusterService,
                    config,
                    sslContextManager)
  }

  @Provides
  @Singleton
  def provideHdpProxyRoute(actorSystem: ActorSystem,
                            actorMaterializer: ActorMaterializer,
                            clusterData: ClusterDataApi,
                            sslContextManager: SslContextManager,
                            config: Config): HdpRoute = {
    new HdpRoute(actorSystem,
      actorMaterializer,
      clusterData,
      sslContextManager: SslContextManager,
      config)
  }

  @Provides
  @Singleton
  def provideConfigurationRoute(config: Config, sslContextManager: SslContextManager): ConfigurationRoute = {
    new ConfigurationRoute(
      config,
      sslContextManager
    )
  }

  @Provides
  @Singleton
  def provideSslContextManager(config: Config, dpClusterService: DpClusterService, certificateService: CertificateService, materializer: ActorMaterializer, actorSystem: ActorSystem): SslContextManager = {
    new SslContextManager(
      config,
      dpClusterService,
      certificateService,
      materializer,
      actorSystem
    )
  }

  @Provides
  @Singleton
  def provideCertificateService(implicit ws: WSClient, config: Config): CertificateService = {
    new CertificateServiceImpl(config)
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
  def provideDpProfileRoute(storageInterface: StorageInterface,
                            credentialInterface: CredentialInterface,
                            clusterComponentService: ClusterComponentService,
                            clusterHostsService: ClusterHostsService,
                            clusterDataApi: ClusterDataApi,
                            config: Config,
                            sslContextManager: SslContextManager): DpProfilerRoute = {
    new DpProfilerRoute(clusterComponentService,
                        clusterHostsService,
                        storageInterface,
                        clusterDataApi,
                        config,
                        sslContextManager)
  }

  @Provides
  @Singleton
  def provideRangerRoute(storageInterface: StorageInterface,
                         credentialInterface: CredentialInterface,
                         clusterComponentService: ClusterComponentService,
                         clusterHostsService: ClusterHostsService,
                         dpClusterService: DpClusterService,
                         clusterService: ClusterService,
                         clusterDataApi: ClusterDataApi,
                         config: Config,
                         sslContextManager: SslContextManager): RangerRoute = {
    new RangerRoute(clusterComponentService,
                    clusterHostsService,
                    storageInterface,
                    credentialInterface,
                    dpClusterService,
                    clusterService,
                    clusterDataApi,
                    config,
                    sslContextManager)
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
                        ambariRoute: AmbariRoute,
                        configurationRoute: ConfigurationRoute): Webserver = {
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
        dpProfilerRoute.datasetAssetMapping ~
        dpProfilerRoute.scheduleInfo ~
        dpProfilerRoute.auditResults ~
        dpProfilerRoute.auditActions ~
        dpProfilerRoute.profilerMetrics ~
        atlasRoute.hiveAttributes ~
        atlasRoute.hiveTables ~
        atlasRoute.atlasEntities ~
        atlasRoute.atlasEntity ~
        atlasRoute.atlasLineage ~
        atlasRoute.atlasTypeDefs ~
        statusRoute.route ~
        statusRoute.sync ~
        statusRoute.health ~
        statusRoute.metrics ~
        ambariRoute.route ~
        ambariRoute.configRoute ~
        ambariRoute.serviceStateRoute ~
        ambariRoute.ambariClusterProxy ~
        ambariRoute.ambariGenericProxy ~
        configurationRoute.reloadCertificates
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
                         sslContextManager: SslContextManager): ClusterSync = {
    new ClusterSync(actorSystem, config, clusterInterface, sslContextManager)
  }

  @Provides
  @Singleton
  def provideDpClusterSync(actorSystem: ActorSystem,
                           config: Config,
                           clusterInterface: StorageInterface,
                           credentialInterface: CredentialInterface,
                           dpClusterService: DpClusterService,
                           sslContextManager: SslContextManager): DpClusterSync = {
    new DpClusterSync(actorSystem,
                      config,
                      clusterInterface,
                      credentialInterface,
                      dpClusterService,
                      sslContextManager)
  }

}
