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

package com.hortonworks.dataplane.http.routes

import javax.inject.Inject

import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import play.api.libs.ws.WSClient
import com.hortonworks.dataplane.http.JsonSupport._

import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global

class ConfigurationRoute @Inject()(val ws: WSClient, val config: Config) extends BaseRoute {

  val route =
    path("configuration" / "actions" / "reloadCertificates") {
      get {
        complete {
          success(Json.obj("status" -> 200))
        }
      }
    }

}
