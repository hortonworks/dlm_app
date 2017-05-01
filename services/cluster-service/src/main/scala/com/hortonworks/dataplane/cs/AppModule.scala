package com.hortonworks.dataplane.cs

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.db.Webserice.{
  ClusterComponentService,
  ClusterHostsService,
  ClusterService,
  ConfigService,
  LakeService
}
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.http.Webserver
import com.hortonworks.dataplane.http.routes.{AtlasRoute, StatusRoute}
import com.typesafe.config.{Config, ConfigFactory}
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSClient

object AppModule extends AbstractModule {

  override def configure() = {
    bind(classOf[Config]).toInstance(ConfigFactory.load())
    bind(classOf[ActorSystem]).toInstance(ActorSystem("cluster-service"))

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
                      materializer: ActorMaterializer): WSClient = {
    AhcWSClient()
  }

  @Provides
  @Singleton
  def provideLakeService(implicit ws: WSClient,
                         configuration: Config): LakeService = {
    new LakeServiceImpl(configuration)
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
  def provideAtlasRoute(storageInterface: StorageInterface,
                        clusterComponentService: ClusterComponentService,
                        clusterHostsService: ClusterHostsService,
                        config: Config): AtlasRoute = {
    AtlasRoute(storageInterface,
               clusterComponentService,
               clusterHostsService,
               config)
  }

  @Provides
  @Singleton
  def provideStatusRoute(storageInterface: StorageInterface,
                         config: Config,
                         wSClient: WSClient,
                         clusterSync: ClusterSync): StatusRoute = {
    new StatusRoute(wSClient, storageInterface, config, clusterSync)
  }

  @Provides
  @Singleton
  def provideWebservice(actorSystem: ActorSystem,
                        materializer: ActorMaterializer,
                        configuration: Config,
                        atlasRoute: AtlasRoute,
                        statusRoute: StatusRoute): Webserver = {
    import akka.http.scaladsl.server.Directives._
    new Webserver(
      actorSystem,
      materializer,
      configuration,
      atlasRoute.hiveAttributes ~ atlasRoute.hiveTables ~ atlasRoute.atlasEntity ~ statusRoute.route ~ statusRoute.sync)
  }

  @Provides
  @Singleton
  def provideStorageInterface(
      lakeService: LakeService,
      clusterService: ClusterService,
      clusterComponentService: ClusterComponentService,
      clusterHostsServiceImpl: ClusterHostsService,
      configService: ConfigService): StorageInterface = {
    new StorageInterfaceImpl(clusterService,
                             lakeService,
                             clusterComponentService,
                             clusterHostsServiceImpl,
                             configService)
  }

  @Provides
  @Singleton
  def provideClusterSync(actorSystem: ActorSystem,
                         config: Config,
                         clusterInterface: StorageInterface,
                         wSClient: WSClient): ClusterSync = {
    new ClusterSync(actorSystem, config, clusterInterface, wSClient)
  }

}
