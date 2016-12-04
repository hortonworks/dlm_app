import com.google.inject.AbstractModule
import internal.auth.{MongoUserStorage, UserStorage}
import internal.{AmbariSync, ClusterSync}
import internal.persistence._
import reactivemongo.api.MongoDriver

class Module extends AbstractModule {
  def configure() = {
      bind(classOf[ClusterSync]).asEagerSingleton()
      bind(classOf[AmbariSync]).asEagerSingleton()
      bind(classOf[AuthService]).asEagerSingleton()
      bind(classOf[DataStorage]).to(classOf[MongoDataStorage]).asEagerSingleton()
      bind(classOf[SnapshotStorage]).to(classOf[MongoSnapshotStorage]).asEagerSingleton()
      bind(classOf[MongoDriver]).toInstance(new MongoDriver())
      bind(classOf[UserStorage]).to(classOf[MongoUserStorage]).asEagerSingleton()
  }


}
