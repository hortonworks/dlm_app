package com.hortonworks.dataplane.cs

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.db.Webserice.{ClusterComponentService, ClusterHostsService, ClusterService, ConfigService, LakeService}
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.http.Webserver
import com.hortonworks.dataplane.http.routes.AtlasRoute
import com.typesafe.config.{Config, ConfigFactory}
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSClient


object AppModule extends AbstractModule{

  override def configure() = {
    bind(classOf[Config]).toInstance(ConfigFactory.load())
    bind(classOf[ActorSystem]).toInstance(ActorSystem("cluster-service"))
  }

  @Provides
  @Singleton
  def provideMaterializer(implicit actorSystem:ActorSystem):ActorMaterializer = {
    ActorMaterializer()
  }

  @Provides
  @Singleton
  def provideWsClient (implicit actorSystem:ActorSystem,materializer: ActorMaterializer):WSClient = {
    AhcWSClient()
  }


  @Provides
  @Singleton
  def provideLakeService(implicit ws: WSClient,configuration: Config):LakeService = {
    new LakeServiceImpl(configuration)
  }


  @Provides
  @Singleton
  def provideClusterDataService(implicit ws: WSClient,configuration: Config):ClusterComponentService = {
    new ClusterComponentServiceImpl(configuration)
  }


  @Provides
  @Singleton
  def provideClusterService(implicit ws: WSClient,configuration: Config):ClusterService = {
    new ClusterServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideConfigService(implicit ws: WSClient,configuration: Config):ConfigService = {
    new ConfigServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideClusterHostsService(implicit ws: WSClient,configuration: Config):ClusterHostsService = {
    new ClusterHostsServiceImpl(configuration)
  }


  @Provides
  @Singleton
  def provideAtlasRoute(clusterComponentService: ClusterComponentService):AtlasRoute = {
    AtlasRoute(clusterComponentService)
  }

  @Provides
  @Singleton
  def provideWebservice(actorSystem:ActorSystem,materializer: ActorMaterializer,configuration: Config,atlasRoute: AtlasRoute):Webserver = {
     new Webserver(actorSystem,materializer,configuration,atlasRoute.route)
  }


  @Provides
  @Singleton
  def provideClusterInterface(lakeService: LakeService, clusterService: ClusterService,
                              clusterComponentService: ClusterComponentService,clusterHostsServiceImpl: ClusterHostsService,configService: ConfigService):StorageInterface = {
    new StorageInterfaceImpl(clusterService,lakeService,clusterComponentService,clusterHostsServiceImpl,configService)
  }


  @Provides
  @Singleton
  def provideClusterSync(actorSystem: ActorSystem, config: Config, clusterInterface: StorageInterface, wSClient: WSClient): ClusterSync = {
    new ClusterSync(actorSystem,config,clusterInterface,wSClient)
  }



}
