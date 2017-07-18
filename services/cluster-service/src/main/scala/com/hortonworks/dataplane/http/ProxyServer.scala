package com.hortonworks.dataplane.http

import javax.inject.{Inject, Singleton}

import akka.actor.ActorSystem
import akka.event.Logging
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.directives.DebuggingDirectives
import akka.stream.ActorMaterializer
import com.typesafe.config.Config

import scala.util.Try

@Singleton
class ProxyServer @Inject()(private val actorSystem: ActorSystem,
                            private val actorMaterializer: ActorMaterializer, private val config: Config,
                            private val routes:Route ) {

  private implicit val dispatcher = actorSystem.dispatcher
  private val port = Try(config.getInt("dp.services.hdp.proxy.port")).getOrElse(9010)
  private val host = Try(config.getString("dp.services.hdp.proxy.host")).getOrElse("0.0.0.0")

  def init = {
    implicit val system = actorSystem
    implicit val materializer = actorMaterializer
    val loggingRoute = DebuggingDirectives.logRequestResult("Proxy-Log", Logging.DebugLevel)(routes)
    Http().bindAndHandle(loggingRoute, host, port)
  }

}
