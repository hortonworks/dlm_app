/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import java.util
import java.util.Optional

import com.google.inject.name.Named
import com.google.inject.{AbstractModule, Inject, Provides, Singleton}
import com.hortonworks.datapalane.consul._
import com.hortonworks.dataplane.commons.domain.Entities.{VaultAppTokenResponse, VaultInitResponse, VaultUnsealResponse}
import com.hortonworks.dataplane.commons.metrics.MetricsRegistry
import com.hortonworks.dataplane.commons.service.api.{CredentialManager, CredentialNotFoundInKeystoreException, SecretManager}
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService
import com.hortonworks.dataplane.db._
import com.hortonworks.dataplane.db.Webservice._
import com.hortonworks.dataplane.cs._
import play.api.{Configuration, Logger}
import play.api.libs.ws.WSClient

import scala.collection.mutable
import scala.concurrent.Future
import scala.util.{Failure, Success}

class Module extends AbstractModule {
  def configure() = {
    bind(classOf[ConsulInitializer]).asEagerSingleton()
    bind(classOf[MetricsRegistry]).toInstance(MetricsRegistry("dp-app"))
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
  @Named("commentService")
  def provideCommentService(implicit ws: WSClient, configuration: Configuration): CommentService = {
    new CommentServiceImpl(configuration.underlying)
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
  @Named("rangerService")
  def provideRangerService(implicit ws: WSClient, configuration: Configuration): com.hortonworks.dataplane.cs.Webservice.RangerService = {
    implicit val wSClient = ClusterWsClient(ws)
    new RangerServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("dpProfilerService")
  def provideDpProfilerService(implicit ws: WSClient, configuration: Configuration): com.hortonworks.dataplane.cs.Webservice.DpProfilerService = {
    implicit val wSClient = ClusterWsClient(ws)
    new DpProfilerServiceImpl(configuration.underlying)
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
  @Named("configService")
  def provideConfigService(implicit ws: WSClient, configuration: Configuration): ConfigService = {
    new ConfigServiceImpl(configuration.underlying)
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

  @Provides
  @Singleton
  @Named("skuService")
  def provideSkuService(implicit ws: WSClient,configuration: Configuration): SkuService = {
    new SkuServiceImpl(configuration.underlying)
  }

  @Provides
  @Singleton
  @Named("secretManager")
  def provideSecretManager(implicit ws: WSClient,configuration: Configuration): SecretManager = {
    new SecretManager(configuration.underlying)
  }

}

@Singleton
class ConsulInitializer @Inject()(config:Configuration)(implicit ws: WSClient){
  import scala.concurrent.ExecutionContext.Implicits.global

  private val registrar = new ApplicationRegistrar(config.underlying,Optional.of(new AppConsulHook))
  registrar.initialize()

  private val secretManager = new SecretManager(config.underlying)
  val credentialManager = new CredentialManager(config.underlying.getString("dp.keystore.path"), config.underlying.getString("dp.keystore.password"))

  credentialManager.read("vault_secret", Set("keys", "token")).map{secret =>
    secret.values.toList.map(x => new String(x, "UTF-8")) match {
      case List(keys, token) => {
        val keysArr = keys.split("-")
        val futures = secretManager.unsealVault(keysArr)
          futures onComplete  {
            case Failure(ex) => throw new Exception("Unseal could not be completed", ex)
            case Success(res) => {
 //            secretManager.createAppRole(config.underlying.getString("vault.roleName"), config.underlying.getString("vault.appPath"), token).map{ createResponse =>
               secretManager.getToken(config.underlying.getString("vault.roleName"), config.underlying.getString("vault.appPath"), token).map{ appToken =>
//                 val appTokenResponse = token.asInstanceOf[VaultAppTokenResponse]
//                 secretManager.readFromVault("secret/my-secret", appTokenResponse.auth.client_token)
 //               secretManager.readFromVault("my-secret", appToken.auth.client_token)
                 secretManager.writeToVault(Map("padma" -> "priya"),"dp-core/padma", appToken.auth.client_token)
               }
//              }
            }
          }
      }
    }
  }.recover {
    case ex: CredentialNotFoundInKeystoreException =>
      secretManager.initializeVault().map { res =>
//        var map = Map[String, Array[Byte]]()
//        var i = 1
//        for(key <- res.keys){
//          map += (key+i -> key.getBytes("UTF-8"))
//          i += 1
//        }
//        map += ("token" -> res.root_token.getBytes("UTF-8"))
        credentialManager.write("vault_secret", Map("keys" -> res.keys.mkString("-").getBytes("UTF-8"), "token" -> res.root_token.getBytes("UTF-8")))
        val futures = secretManager.unsealVault(res.keys)
        futures onComplete  {
          case Failure(e) => throw new Exception("Unseal could not be completed", e)
          case Success(successResponse) => {
            secretManager.enableAppRole(res.root_token,"dp-core", "DP Core").map { enableResponse =>
            //  secretManager.createAppRole("dp-core","dp-core", res.root_token).map{ createResponse =>
              secretManager.getToken(config.underlying.getString("vault.roleName"), config.underlying.getString("vault.appPath"), res.root_token).map{ appToken =>
                 // val appTokenResponse = token.asInstanceOf[VaultAppTokenResponse]
                 // secretManager.readFromVault("secret/my-secret", appTokenResponse.auth.client_token)
                    secretManager.readFromVault("my-secret", appToken.auth.client_token)
                  }
                }
              //}
            }
          }
        }
      }


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
