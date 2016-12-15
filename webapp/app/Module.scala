import akka.actor.{ActorRef, ActorSystem, Props}
import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Provides}
import com.hw.dp.services.atlas.AtlasHiveApi
import internal.{AmbariSync, AtlasApiCache}
import internal.auth.{MongoUserStorage, UserStorage}
import internal.persistence._
import play.api.Configuration
import play.api.libs.ws.WSClient
import reactivemongo.api.MongoDriver

import scala.concurrent.Future

class Module extends AbstractModule {
  def configure() = {
      bind(classOf[AmbariSync]).asEagerSingleton()
      bind(classOf[AuthService]).asEagerSingleton()
      bind(classOf[DataStorage]).to(classOf[MongoDataStorage]).asEagerSingleton()
      bind(classOf[MongoDriver]).toInstance(new MongoDriver())
      bind(classOf[UserStorage]).to(classOf[MongoUserStorage]).asEagerSingleton()
  }


  @Provides
  @Named("atlasApiCache")
  def provideApiCache(configuration: Configuration,actorSystem: ActorSystem,ws: WSClient):ActorRef = {
    actorSystem.actorOf(Props(classOf[AtlasApiCache], configuration, actorSystem,ws),"atlasApiCache")
  }

}
