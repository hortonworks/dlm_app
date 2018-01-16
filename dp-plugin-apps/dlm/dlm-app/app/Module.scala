/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import com.google.inject.{AbstractModule, Inject, Provides, Singleton}
import java.util
import java.util.Optional

import com.google.inject.name.Named
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.db.Webservice._
import play.api.{Configuration, Logger}
import play.api.libs.ws.WSClient
import com.hortonworks.dataplane.commons.service.api.CredentialManager
import com.hortonworks.dlm.beacon._
import com.hortonworks.dlm.beacon.WebService._
import com.hortonworks.datapalane.consul._
import com.hortonworks.dataplane.commons.metrics.MetricsRegistry
import com.hortonworks.dataplane.cs.{AmbariWebServiceImpl, ClusterWsClient, KnoxProxyWsClient}
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService
import com.typesafe.config.ConfigFactory


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
    val config = new Configuration(ConfigFactory.load())
    bind(classOf[ConsulInitializer]).asEagerSingleton()
    bind(classOf[CredentialManager]).toInstance(CredentialManager(config.getString("dp.keystore.path").get,
      config.getString("dp.keystore.password").get))
    bind(classOf[MetricsRegistry]).toInstance(MetricsRegistry("dlm-app"))
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
    implicit val knoxProxyWsClient:KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconClusterServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconPairService")
  def provideBeaconClusterPairService(implicit ws: WSClient,configuration: Configuration):BeaconPairService = {
    implicit val knoxProxyWsClient:KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconPairServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconPolicyService")
  def provideBeaconPolicyService(implicit ws: WSClient,configuration: Configuration):BeaconPolicyService = {
    implicit val knoxProxyWsClient:KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconPolicyServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconPolicyInstanceService")
  def provideBeaconPolicyInstanceService(implicit ws: WSClient,configuration: Configuration):BeaconPolicyInstanceService = {
    implicit val knoxProxyWsClient :KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconPolicyInstanceServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconEventService")
  def provideBeaconEventService(implicit ws: WSClient,configuration: Configuration):BeaconEventService = {
    implicit val knoxProxyWsClient:KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconEventServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconLogService")
  def provideBeaconLogService(implicit ws: WSClient,configuration: Configuration):BeaconLogService = {
    implicit val knoxProxyWsClient:KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconLogServiceImpl()
  }

  @Provides
  @Singleton
  @Named("beaconBrowseService")
  def provideBeaconBrowseService(implicit ws: WSClient,configuration: Configuration):BeaconBrowseService = {
    implicit val knoxProxyWsClient:KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconBrowseServiceImpl()
  }


  @Provides
  @Singleton
  @Named("beaconAdminService")
  def provideBeaconAdminService(implicit ws: WSClient,configuration: Configuration):BeaconAdminService = {
    implicit val knoxProxyWsClient:KnoxProxyWsClient = KnoxProxyWsClient(ws, configuration.underlying)
    new BeaconAdminServiceImpl()
  }


  @Provides
  @Singleton
  @Named("ambariService")
  def provideAmbariService(implicit ws: WSClient, configuration: Configuration):AmbariWebService = {
    implicit val clusterWsClient:ClusterWsClient = ClusterWsClient(ws)
    new AmbariWebServiceImpl(configuration.underlying)
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
      map.put("dp.services.proxy.service.uri",config.getString("dp.services.proxy.service.path").get)
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

