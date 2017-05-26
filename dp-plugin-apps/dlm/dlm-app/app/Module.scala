import com.google.inject.AbstractModule
import java.time.Clock
import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Provides, Singleton}
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.db.Webservice._
import play.api.Configuration
import play.api.libs.ws.WSClient

import com.hortonworks.dlm.beacon.{BeaconClusterServiceImpl, BeaconPairServiceImpl, BeaconPolicyServiceImpl, BeaconPolicyInstanceServiceImpl, BeaconEventServiceImpl}
import com.hortonworks.dlm.beacon.WebService.{BeaconClusterService, BeaconPairService, BeaconPolicyService, BeaconPolicyInstanceService, BeaconEventService}
import com.hortonworks.dlm.webhdfs.WebService.FileService
import com.hortonworks.dlm.webhdfs.FileServiceImpl


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
  @Named("beaconPairService")
  def provideBeaconClusterPairService(implicit ws: WSClient,configuration: Configuration):BeaconPairService = {
    new BeaconPairServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconPolicyService")
  def provideBeaconPolicyService(implicit ws: WSClient,configuration: Configuration):BeaconPolicyService = {
    new BeaconPolicyServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconPolicyInstanceService")
  def provideBeaconPolicyInstanceService(implicit ws: WSClient,configuration: Configuration):BeaconPolicyInstanceService = {
    new BeaconPolicyInstanceServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconEventService")
  def provideBeaconEventService(implicit ws: WSClient,configuration: Configuration):BeaconEventService = {
    new BeaconEventServiceImpl()
  }

  @Provides
  @Singleton
  @Named("fileService")
  def provideFileService(implicit ws: WSClient,configuration: Configuration):FileService = {
    new FileServiceImpl()
  }

}
