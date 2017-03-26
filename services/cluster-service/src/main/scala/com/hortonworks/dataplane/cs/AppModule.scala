package com.hortonworks.dataplane.cs

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.db.Webserice.{ClusterService, LakeService}
import com.hortonworks.dataplane.db.{ClusterServiceImpl, LakeServiceImpl}
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
  def provideClusterService(implicit ws: WSClient,configuration: Config):ClusterService = {
    new ClusterServiceImpl(configuration)
  }

  @Provides
  @Singleton
  def provideClusterInterface(lakeService: LakeService, clusterService: ClusterService):ClusterInterface = {
    new ClusterInterfaceImpl(clusterService,lakeService)
  }


  @Provides
  @Singleton
  def provideClusterSync(actorSystem: ActorSystem,config: Config,clusterInterface: ClusterInterface,wSClient: WSClient): ClusterSync = {
    new ClusterSync(actorSystem,config,clusterInterface,wSClient)
  }



}
