import java.util
import java.util.Optional

import akka.actor.{ActorRef, ActorSystem, Props}
import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Inject, Provides, Singleton}
import com.hortonworks.datapalane.consul._
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.db.Webservice._
import com.hortonworks.dataplane.cs._
import com.hortonworks.dataplane.commons.auth.Authenticated
import play.api.{Configuration, Logger}
import play.api.inject.ApplicationLifecycle
import play.api.libs.ws.WSClient

import scala.concurrent.Future

class Module extends AbstractModule {
  def configure() = {
    bind(classOf[Authenticated]).asEagerSingleton()
    bind(classOf[ConsulInitializer]).asEagerSingleton()
  }


  @Provides
  @Singleton
  @Named("userService")
  def provideUserService(implicit ws: WSClient, configuration: Configuration): UserService = {
    new UserServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("groupService")
  def provideGroupService(implicit ws: WSClient, configuration: Configuration): GroupService = {
    new GroupServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("dataSetService")
  def provideDataSetService(implicit ws: WSClient, configuration: Configuration): DataSetService = {
    new DataSetServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("categoryService")
  def provideCategoryService(implicit ws: WSClient, configuration: Configuration): CategoryService = {
    new CategoryServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("dataSetCategoryService")
  def provideDataSetCategoryService(implicit ws: WSClient, configuration: Configuration): DataSetCategoryService = {
    new DataSetCategoryServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("dpClusterService")
  def provideDpClusterService(implicit ws: WSClient, configuration: Configuration): DpClusterService = {
    new DpClusterServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("locationService")
  def provideLocationService(implicit ws: WSClient, configuration: Configuration): LocationService = {
    new LocationServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("clusterService")
  def provideClusterService(implicit ws: WSClient, configuration: Configuration): ClusterService = {
    new ClusterServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("atlasService")
  def provideAtlasService(implicit ws: WSClient, configuration: Configuration): com.hortonworks.dataplane.cs.Webservice.AtlasService = {
    implicit val wSClient = ClusterWsClient(ws)
    new AtlasServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("clusterAmbariService")
  def provideAmbariWebService(implicit ws: WSClient,configuration: Configuration):AmbariWebService = {
    implicit val clusterWsClient:ClusterWsClient = ClusterWsClient(ws)
    new AmbariWebServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("clusterHostsService")
  def provideClusterHostsService(implicit ws: WSClient, configuration: Configuration): ClusterHostsService = {
    new ClusterHostsServiceImpl(configuration.underlying)
  }


  @Provides
  @Singleton
  @Named("clusterComponentsService")
  def provideClusterComponentsService(implicit ws: WSClient, configuration: Configuration): ClusterComponentService = {
    new ClusterComponentServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("ldapConfigService")
  def provideLdapConfigServic(implicit ws: WSClient, configuration: Configuration): LdapConfigService = {
    new LdapConfigServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("workspaceService")
  def provideWorkspaceService(implicit ws: WSClient, configuration: Configuration): WorkspaceService = {
    new WorkspaceServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("assetWorkspaceService")
  def provideAssetWorkspaceService(implicit ws: WSClient, configuration: Configuration): AssetWorkspaceService = {
    new AssetWorkspaceServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("notebookWorkspaceService")
  def provideNotebookWorkspaceService(implicit ws: WSClient, configuration: Configuration): NotebookWorkspaceService = {
    new NotebookWorkspaceServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("dataAssetService")
  def provideDataAssetService(implicit ws: WSClient,configuration: Configuration): DataAssetService = {
    new DataAssetServiceImpl(configuration.underlying)
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

    override def onServiceCheck(serviceId: String): Unit = Logger.info("Running a service check for serviceId "+serviceId)
  }

}
