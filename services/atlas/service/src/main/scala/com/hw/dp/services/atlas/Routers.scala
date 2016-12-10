package com.hw.dp.services.atlas

import akka.actor.{Actor, ActorRef, Props}
import akka.routing.{ActorRefRoutee, RoundRobinRoutingLogic, Router}

class TableRouter(collector: ActorRef) extends Actor {
  var router = {
    val routees = Vector.fill(5) {
      val r = context.actorOf(Props(classOf[TableFetcher],collector))
      context watch r
      ActorRefRoutee(r)
    }
    Router(RoundRobinRoutingLogic(), routees)
  }

  def receive = {
    case GetTable(table,fetchUrl,template) =>
        router.route(GetTable(table,fetchUrl,template),self)
  }
}


class DbRouter(router: ActorRef) extends Actor {
  var dbRouter = {
    val routees = Vector.fill(5) {
      val r = context.actorOf(Props(classOf[DbFetcher],router))
      context watch r
      ActorRefRoutee(r)
    }
    Router(RoundRobinRoutingLogic(), routees)
  }

  def receive = {
    case GetDb(db,fetchUrl,template) =>
      dbRouter.route(GetDb(db,fetchUrl,template),self)
  }
}

