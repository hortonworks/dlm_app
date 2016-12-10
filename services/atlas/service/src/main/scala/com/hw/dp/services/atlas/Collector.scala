package com.hw.dp.services.atlas

import akka.actor.{Actor, ActorLogging}
import akka.actor.Actor.Receive

import scala.collection.mutable
import scala.collection.mutable.ListBuffer

// Collect information about the schema
class Collector extends Actor with ActorLogging{

  val schema = mutable.Map[String,mutable.Set[Table]]()

  override def receive: Receive = {

    case AddTable(table) =>
      val db = table.database
      log.info(s"Adding Database ${db}")
      val tables = schema.get(db)
      tables match {
        case None =>
          schema.put(db,mutable.HashSet[Table](table))
        case Some(set) =>
          set.add(table)
      }

//      println(schema)
  }



}

case class AddTable(table: Table)
