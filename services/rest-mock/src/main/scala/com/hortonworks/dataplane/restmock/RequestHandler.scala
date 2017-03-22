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
