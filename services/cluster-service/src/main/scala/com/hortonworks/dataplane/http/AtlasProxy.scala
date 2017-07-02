package com.hortonworks.dataplane.http

import javax.inject.{Inject, Singleton}

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Sink, Source}
import com.typesafe.config.Config

import scala.util.Try


/**
  * A minimal proxy for Atlas calls
  * The atlas client is provided the address of this proxy
  * The proxy attaches the cluster related context and forwards the call
  * to atlas
  *
  *                             ---------DP---------- -------ATLAS------
  * The expected URL pattern is [/dp/cluster/:clusterID][/api/atlas/v2/...]
  * @param actorSystem
  * @param actorMaterializer
  * @param config
  */

@Singleton
class AtlasProxy @Inject()(private val actorSystem: ActorSystem,
                           private val actorMaterializer: ActorMaterializer, private val config: Config, private val routes:Route ) {

  private implicit val dispatcher = actorSystem.dispatcher
  private val port = Try(config.getInt("dp.services.cluster.atlas.proxy.port")).getOrElse(9010)
  private val host = Try(config.getString("dp.services.cluster.atlas.proxy.host")).getOrElse("0.0.0.0")

  def init = {
    implicit val system = actorSystem
    implicit val materializer = actorMaterializer
    Http().bindAndHandle(routes, host, port)
  }

}
