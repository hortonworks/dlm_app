package com.hw.dp.services.atlas

import akka.actor.{Actor, ActorLogging, ActorRef}
import org.springframework.web.client.RestTemplate
import play.api.libs.json.Json
import Formatters._

/**
  * Fetches information about a Database
  * @param collector
  */
class TableFetcher(collector: ActorRef) extends Actor with ActorLogging {

  override def receive: Receive = {
    case GetTable(table,fetchUrl,template) =>
      // for the database get table information
    val newUrl =s"${fetchUrl}/${table}?format=extended"
    val json = template.getForObject(newUrl,classOf[String])
      println(json)
    val jsValue = Json.parse(json)
    jsValue.validate[Table].map { table =>
//      println(table)
      collector ! AddTable(table)
    }

  }

}
