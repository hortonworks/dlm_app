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
      .url(s"$serviceUrl/service/core/api/knox/configuration")
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
