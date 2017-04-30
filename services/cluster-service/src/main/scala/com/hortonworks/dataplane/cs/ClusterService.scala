package com.hortonworks.dataplane.cs

import com.google.inject.Guice
import com.hortonworks.dataplane.http.Webserver
import com.typesafe.config.Config
import play.api.Logger


object ClusterService extends App {

  val logger = Logger("Cluster service")


  logger.info("Setting up Guice injector")
  private val injector = Guice.createInjector(AppModule)
  private val clusterSync = injector.getInstance(classOf[ClusterSync])
  private val configuration = injector.getInstance(classOf[Config])

  logger.info(s"Starting a server on ${configuration.getInt("dp.services.cluster.http.port")}")
//  private val server = injector.getInstance(classOf[Webserver])
//  server.init


  logger.info("Starting cluster sync")
  clusterSync.initialize


}