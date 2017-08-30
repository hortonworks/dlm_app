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

import akka.actor.{ActorSystem, Props}
import akka.stream.ActorMaterializer
import com.hortonworks.dataplane.restmock.{Mockserver, RequestHandler}
import org.scalatest.Suite
import play.api.Logger

/**
  * Since tests may run at the same time, try to randomise ports in each test
  * Tests may otherwise fail
  */
trait ServerSupport {

  this: Suite =>

  val logger = Logger(classOf[ServerSupport])

  protected implicit val system = ActorSystem("server")
  protected implicit val materializer = ActorMaterializer()
  protected implicit val myActor = system.actorOf(Props[RequestHandler], name = "handler")
  protected val server = Mockserver()

}
