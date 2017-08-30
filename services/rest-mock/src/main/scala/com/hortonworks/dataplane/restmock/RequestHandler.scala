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

package com.hortonworks.dataplane.restmock

import akka.actor.Actor
import akka.http.scaladsl.model.{HttpRequest, HttpResponse, StatusCodes}

import scala.collection.mutable.ListBuffer

class RequestHandler extends Actor {

  val responses = ListBuffer[Return]()

  override def receive: Receive = {

    case Clear() =>
      responses.clear()

    case Return(delegate, response) =>
      responses += Return(delegate, response)

    case req: HttpRequest =>
      responses
        .find(_.builder.verify(req))
        .map { ret =>
          sender ! ret.response(HttpResponse())
        }
        .getOrElse(sender ! HttpResponse(StatusCodes.NotFound))
  }

}
