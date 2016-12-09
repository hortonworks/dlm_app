package com.hw.dp.services.atlas

import akka.actor.Actor.Receive
import akka.actor.{Actor, ActorLogging, ActorRef}
import akka.routing.Router
import org.springframework.web.client.RestTemplate
import play.api.libs.json.Json


/**
  * Fetches information about a Database
  * @param collector
  */
class DbFetcher(tableRouter:ActorRef) extends Actor with ActorLogging {

  override def receive: Receive = {
    case GetDb(db,baseUrl,template) =>
      // for the database get table information
    val newUrl =s"${baseUrl}/${db.database}/table"
    val json = template.getForObject(newUrl,classOf[String])
      println(json)
    val jsValue = Json.parse(json)
    val tables = (jsValue \ "tables").as[List[String]]
    tables.foreach(t => tableRouter ! GetTable(t,newUrl,template))
  }

}
