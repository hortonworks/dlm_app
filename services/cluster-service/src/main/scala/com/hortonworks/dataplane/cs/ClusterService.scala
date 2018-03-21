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

package com.hortonworks.dataplane.cs

import java.util
import java.util.Optional

import com.google.inject.Guice
import com.hortonworks.datapalane.consul._
import com.hortonworks.dataplane.http.{ProxyServer, Webserver}
import com.typesafe.config.{Config, ConfigFactory}
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

object ClusterService extends App {

  val logger = Logger("Cluster service")

  logger.info("Setting up Guice injector")
  private val injector = Guice.createInjector(AppModule)
  private val clusterSync = injector.getInstance(classOf[ClusterSync])
  private val configuration = injector.getInstance(classOf[Config])

  private val server = injector.getInstance(classOf[Webserver])

  private val serverState = server.init

  private val proxy = injector.getInstance(classOf[ProxyServer])
  proxy.init.onComplete { _ =>
    logger.info("Proxy server started, Setting up service registry")
    // load the proxy configuration
    val proxyConfig = configuration.getConfig("dp.services.hdp.proxy")

    val registrar = new ApplicationRegistrar(
      proxyConfig,
      Optional.of(getProxyHook)
    )
    registrar.initialize()

  }

  serverState.onComplete { _ =>
    logger.info("Web service started, Setting up service registry")
    val hook = getHook
    val registrar = new ApplicationRegistrar(configuration, Optional.of(hook))
    registrar.initialize()
  }

  // This hook takes care of setting up the application correctly
  // when consul and ZUUL services are available
  // without them fallback configurations will be used
  private def getHook = {
    new ConsulHook {

      override def onServiceRegistration(dpService: DpService) = {
        logger.info(s"Registered service $dpService")
        // Service registered now, override the db service endpoint
        val map = new util.HashMap[String, String]()
        map.put("dp.services.db.service.uri", configuration.getString("dp.services.db.service.path"))
        map.put("dp.services.proxy.service.uri", configuration.getString("dp.services.hdp.proxy.service.path"))
        val gateway = new Gateway(configuration, map, Optional.of(this))
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

      override def gatewayDiscoverFailure(message: String,
                                          th: Throwable): Unit = {
        logger.warn(message, th)
        tryStartClusterSync
      }

      override def serviceRegistrationFailure(serviceId: String,
                                              th: Throwable) = {
        logger.warn(s"Service registration failed for $serviceId", th)
        tryStartClusterSync
      }

      override def onServiceDeRegister(serviceId: String): Unit =
        logger.info(s"Service removed from consul $serviceId")

      override def onRecoverableException(reason: String,
                                          th: Throwable): Unit =
        logger.warn(reason)

      override def onServiceCheck(serviceId: String): Unit =
        logger.debug(s"Running a service check for serviceId $serviceId")
    }
  }

  // Try to register the service on consul
  private def getProxyHook = {
    new ConsulHook {
      override def gatewayDiscoverFailure(message: String,
                                          th: Throwable): Unit = ???

      override def onServiceRegistration(dpService: DpService): Unit =
        logger.info(s"Service registered $dpService")

      override def onRecoverableException(reason: String,
                                          th: Throwable): Unit =
        logger.info(s"Recovered from $reason")

      override def onServiceDeRegister(serviceId: String): Unit =
        logger.info(s"Service removed $serviceId")

      override def gatewayDiscovered(zuulServer: ZuulServer): Unit = ???

      override def onServiceCheck(serviceId: String): Unit =
        logger.debug(s"Running a service check for serviceId $serviceId")

      override def serviceRegistrationFailure(serviceId: String,
                                              th: Throwable): Unit =
        logger.warn(s"Service registration failed for $serviceId", th)
    }
  }

}
