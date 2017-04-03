import akka.actor.{ActorRef, ActorSystem, Props}
import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.db.Webserice._
import internal.{AmbariSync, AtlasApiCache}
import internal.persistence._
import play.api.Configuration
import play.api.libs.ws.WSClient
import reactivemongo.api.MongoDriver

class Module extends AbstractModule {
  def configure() = {
      bind(classOf[AmbariSync]).asEagerSingleton()
      bind(classOf[ClusterDataStorage]).to(classOf[MongoClusterDataStorage]).asEagerSingleton()
      bind(classOf[DataSetStorage]).to(classOf[MongoDataSetStorage]).asEagerSingleton()
      bind(classOf[MongoDriver]).toInstance(new MongoDriver())

  }


  @Provides
  @Singleton
  @Named("atlasApiCache")
  def provideApiCache(configuration: Configuration,actorSystem: ActorSystem,ws: WSClient):ActorRef = {
    actorSystem.actorOf(Props(classOf[AtlasApiCache], configuration, actorSystem,ws),"atlasApiCache")
  }


  @Provides
  @Singleton
  @Named("userService")
  def provideUserService(implicit ws: WSClient,configuration: Configuration):UserService = {
    new UserServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("lakeService")
  def provideLakeService(implicit ws: WSClient,configuration: Configuration):LakeService = {
    new LakeServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("locationService")
  def provideLocationService(implicit ws: WSClient,configuration: Configuration):LocationService = {
    new LocationServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("clusterService")
  def provideClusterService(implicit ws: WSClient,configuration: Configuration):ClusterService = {
    new ClusterServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("clusterHostsService")
  def provideClusterHostsService(implicit ws: WSClient,configuration: Configuration):ClusterHostsService = {
    new ClusterHostsServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("clusterComponentsService")
  def provideClusterComponentsService(implicit ws: WSClient,configuration: Configuration):ClusterComponentService = {
    new ClusterComponentServiceImpl(configuration.underlying)
  }


}
