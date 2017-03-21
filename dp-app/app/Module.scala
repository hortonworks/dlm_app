import akka.actor.{ActorRef, ActorSystem, Props}
import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.db.{LakeServiceImpl, UserServiceImpl}
import com.hortonworks.dataplane.db.Webserice.{LakeService, UserService}
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



}
