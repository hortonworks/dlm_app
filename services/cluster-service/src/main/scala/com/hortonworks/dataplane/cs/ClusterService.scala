package com.hortonworks.dataplane.cs

import com.google.inject.Guice
import play.api.Logger

object ClusterService extends App {

  val logger = Logger("Cluster service")

  logger.info("Setting up Guice injector")
  private val injector = Guice.createInjector(AppModule)

  private val clusterSync = injector.getInstance(classOf[ClusterSync])

  logger.info("Starting cluster sync")

  clusterSync.initialize

}