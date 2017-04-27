import com.google.inject.AbstractModule
import java.time.Clock
import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.db.Webserice._
import play.api.Configuration
import play.api.libs.ws.WSClient

import com.hortonworks.dlm.beacon.{BeaconClusterServiceImpl,BeaconClusterPairServiceImpl}
import com.hortonworks.dlm.beacon.WebService.{BeaconClusterService,BeaconClusterPairService}


/**
 * This class is a Guice module that tells Guice how to bind several
 * different types. This Guice module is created when the Play
 * application starts.

 * Play will automatically use any class called `Module` that is in
 * the root package. You can create modules in other locations by
 * adding `play.modules.enabled` settings to the `application.conf`
 * configuration file.
 */
class Module extends AbstractModule {

  override def configure() = {
    // Use the system clock as the default implementation of Clock
    bind(classOf[Clock]).toInstance(Clock.systemDefaultZone)
  }

  @Provides
  @Singleton
  @Named("clusterService")
  def provideClusterService(implicit ws: WSClient,configuration: Configuration):ClusterService = {
    new ClusterServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("clusterComponentService")
  def provideClusterComponentService(implicit ws: WSClient,configuration: Configuration):ClusterComponentService = {
    new ClusterComponentServiceImpl(configuration.underlying)
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
  @Named("beaconClusterService")
  def provideBeaconClusterService(implicit ws: WSClient,configuration: Configuration):BeaconClusterService = {
    new BeaconClusterServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconClusterPairService")
  def provideBeaconClusterPairService(implicit ws: WSClient,configuration: Configuration):BeaconClusterPairService = {
    new BeaconClusterPairServiceImpl()
  }

}