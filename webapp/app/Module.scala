import com.google.inject.AbstractModule
import internal.{AmbariSync, ClusterSync}
import internal.persistence.{DataStorage, MongoDataStorage, MongoSnapshotStorage, SnapshotStorage}
import reactivemongo.api.MongoDriver

class Module extends AbstractModule {
  def configure() = {
      bind(classOf[ClusterSync]).asEagerSingleton()
      bind(classOf[AmbariSync]).asEagerSingleton()
      bind(classOf[DataStorage]).to(classOf[MongoDataStorage]).asEagerSingleton()
      bind(classOf[SnapshotStorage]).to(classOf[MongoSnapshotStorage]).asEagerSingleton()
      bind(classOf[MongoDriver]).toInstance(new MongoDriver())
  }


}
