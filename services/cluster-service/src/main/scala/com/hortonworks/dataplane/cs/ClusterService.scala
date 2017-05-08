package com.hortonworks.dataplane.cs

import java.util
import java.util.Optional

import com.google.inject.Guice
import com.hortonworks.datapalane.consul._
import com.hortonworks.dataplane.http.Webserver
import com.typesafe.config.Config
import play.api.Logger

import scala.util.Try
import scala.concurrent.ExecutionContext.Implicits.global

object ClusterService extends App {

  val logger = Logger("Cluster service")

  logger.info("Setting up Guice injector")
  private val injector = Guice.createInjector(AppModule)
  private val clusterSync = injector.getInstance(classOf[ClusterSync])
  private val configuration = injector.getInstance(classOf[Config])

  logger.info(
    s"Starting a server on ${configuration.getInt("dp.services.cluster.http.port")}")
  private val server = injector.getInstance(classOf[Webserver])

  private val serverState = server.init

  logger.info("Starting cluster sync")

  // Try to register the service on consul
  serverState.onComplete { s =>
    logger.info("Web service started, Setting up service registry")
    val hook = getHook
    val registrar = new ApplicationRegistrar(configuration,Optional.of(hook))
    registrar.initialize()
  }


  // This hook takes care of setting up the application correctly
  // when consul and ZUUL services are available
  // without them, the fallback configurations will be used
  private def getHook = {
    new ConsulHook {

      override def onServiceRegistration(dpService: DpService) = {
        logger.info(s"Registered service $dpService")
        // Service registered now, override the db service endpoint
        val config = configuration.getConfig("dp.services.db")
        val map = new util.HashMap[String,String]()
        map.put("dp.services.db.service.uri",config.getString("service.path"))
        val gateway = new Gateway(configuration,map,Optional.of(this))
        gateway.initialize()

      }


      override def gatewayDiscovered(zuulServer: ZuulServer): Unit = {
      logger.info(s"Gateway Discovered - $zuulServer")
        tryStartClusterSync
      }


      private def tryStartClusterSync = {
        if (Try(configuration.getBoolean("dp.services.cluster.run.jobs"))
          .getOrElse(false)) {
          clusterSync.initialize
        }
      }

      override def gatewayDiscoverFailure(message: String, th: Throwable): Unit  = {
        logger.warn(message,th)
        tryStartClusterSync
      }

      override def serviceRegistrationFailure(serviceId: String, th: Throwable) = {
        logger.warn(s"Service registration failed for $serviceId",th)
        tryStartClusterSync
      }

      override def onServiceDeRegister(serviceId: String): Unit = logger.info(s"Service removed from consul $serviceId")

      override def onRecoverableException(reason: String, th: Throwable): Unit = logger.warn(reason,th)
    }
  }
}
