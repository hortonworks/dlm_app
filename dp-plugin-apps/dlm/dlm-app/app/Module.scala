import com.google.inject.{AbstractModule, Inject, Provides, Singleton}
import java.time.Clock
import java.util
import java.util.Optional

import com.google.inject.name.Named
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.db.Webservice._
import play.api.{Configuration, Logger}
import play.api.libs.ws.WSClient
import com.hortonworks.dlm.beacon.{BeaconClusterServiceImpl, BeaconEventServiceImpl, BeaconPairServiceImpl, BeaconPolicyInstanceServiceImpl, BeaconPolicyServiceImpl}
import com.hortonworks.dlm.beacon.WebService.{BeaconClusterService, BeaconEventService, BeaconPairService, BeaconPolicyInstanceService, BeaconPolicyService}
import com.hortonworks.dlm.webhdfs.WebService.FileService
import com.hortonworks.dlm.webhdfs.FileServiceImpl
import com.hortonworks.datapalane.consul._


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
  
  def configure() = {
    bind(classOf[ConsulInitializer]).asEagerSingleton()
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
  @Named("dpClusterService")
  def provideDpClusterService(implicit ws: WSClient, configuration: Configuration):DpClusterService = {
    new DpClusterServiceImpl(configuration.underlying)
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

@Singleton
class ConsulInitializer @Inject()(config:Configuration){

  private val registrar = new ApplicationRegistrar(config.underlying,Optional.of(new AppConsulHook))
  registrar.initialize()

  private class AppConsulHook extends ConsulHook{
    override def onServiceRegistration(dpService: DpService) = {
      Logger.info(s"Registered service $dpService")
      // Service registered now, override the db service endpoints
      val map = new util.HashMap[String,String]()
      map.put("dp.services.db.service.uri",config.getString("dp.services.db.service.path").get)
      map.put("dp.services.cluster.service.uri",config.getString("dp.services.cluster.service.path").get)
      val gateway = new Gateway(config.underlying,map,Optional.of(this))
      gateway.initialize()
    }

    override def serviceRegistrationFailure(serviceId: String, th: Throwable):Unit = Logger.warn(s"Service registration failed for $serviceId",th)

    override def onServiceDeRegister(serviceId: String): Unit = Logger.info(s"Service removed from consul $serviceId")

    override def onRecoverableException(reason: String, th: Throwable): Unit = Logger.warn(reason)

    override def gatewayDiscovered(zuulServer: ZuulServer): Unit = Logger.info(s"Gateway dicovered $zuulServer")

    override def gatewayDiscoverFailure(message: String, th: Throwable): Unit = Logger.warn("Gateway discovery failed, endpoints configured in config will be used")

    override def onServiceCheck(serviceId: String): Unit = Logger.info("Running a service check for serviceId "+ serviceId)
  }

}

