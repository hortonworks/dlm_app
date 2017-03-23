package com.hortonworks.dataplane.restmock

import akka.actor.{ActorRef, ActorSystem, PoisonPill, _}
import akka.http.scaladsl.Http
import akka.http.scaladsl.Http.ServerBinding
import akka.http.scaladsl.model.{HttpRequest, HttpResponse}
import akka.pattern.ask
import akka.stream.{ActorMaterializer, Materializer}
import akka.util.Timeout
import com.hortonworks.dataplane.restmock.httpmock.when

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._


class Mockserver(implicit val actor:ActorRef) {

  implicit val timeout:Timeout = 5.seconds

  def handler(req:HttpRequest):Future[HttpResponse] = {

    val future = actor ? req
    future.map(_.asInstanceOf[HttpResponse])
  }


  def startOnPort(port: Int)(implicit as: ActorSystem,materializer:Materializer): () => Unit = {
    val future = Http().bindAndHandleAsync(handler,"127.0.0.1", port = port)
    val func = ()  => {
      future.flatMap(_.unbind()) // trigger unbinding from the port
        .onComplete(_ => as.terminate()) // and shutdown when done
    }
    func
  }

  /**
    * Clear all expectations
    */
  def reset = {
    actor ! Clear()
  }

}

object Mockserver {
  def apply()(implicit actor:ActorRef) = new Mockserver()(actor)
}
