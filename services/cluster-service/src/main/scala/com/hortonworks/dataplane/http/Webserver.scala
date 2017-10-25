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

package com.hortonworks.dataplane.http

import javax.inject.{Inject, Singleton}

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import com.typesafe.config.Config

import scala.util.Try

@Singleton
class Webserver @Inject()(private val actorSystem: ActorSystem,
                          private val actorMaterializer: ActorMaterializer,private val config: Config,
                          private val routes:Route ) {

  private implicit val dispatcher = actorSystem.dispatcher
  private val port = Try(config.getInt("dp.services.cluster.http.port")).getOrElse(9009)
  private val host = Try(config.getString("dp.services.cluster.http.host")).getOrElse("0.0.0.0")

  def init = {
    implicit val system = actorSystem
    implicit val materializer = actorMaterializer
    Http().bindAndHandle(routes, host, port)
  }

}
