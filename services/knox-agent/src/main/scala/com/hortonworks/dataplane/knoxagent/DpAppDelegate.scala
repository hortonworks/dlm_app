package com.hortonworks.dataplane.knoxagent
import akka.actor.ActorSystem
import akka.event.Logging
import play.api.libs.json.JsObject
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
class DpAppDelegate(wsClient: WSClient, actorSystem: ActorSystem) {

  private val logger = Logging(actorSystem, "DpAppDelegate")
  def getLdapConfiguration(serviceUrl: String): Future[Option[KnoxConfig]] = {
    wsClient
      .url(s"$serviceUrl/api/app/api/knox/configuration")
      .get()
      .map { resp =>
        logger.info("got resp from dpapp")
        resp.json
          .validate[KnoxConfig]
          .map { knoxConfig =>
            Some(knoxConfig)
          }
          .getOrElse(
            None
          )
      }

  }
}
