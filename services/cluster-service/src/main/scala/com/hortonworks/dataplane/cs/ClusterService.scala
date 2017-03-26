package com.hortonworks.dataplane.cs

import com.google.inject.Guice
import com.typesafe.config.Config

object ClusterService extends App {

  private val injector = Guice.createInjector(AppModule)
  private val config = injector.getInstance(classOf[ClusterInterface])




}