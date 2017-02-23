package com.hw.dp.datastore

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import com.hw.dp.datastore.routes.CollectionService
import com.hw.dp.db.pg.PgDataDDLImpl
import org.postgresql.ds.PGSimpleDataSource
import org.skife.jdbi.v2.DBI

object ApplicationMain  extends App  {

  implicit val actorSystem = ActorSystem("akka-rest-api")
  implicit val materializer = ActorMaterializer()
  implicit val executionContext = actorSystem.dispatcher

  val ds = new PGSimpleDataSource()
  ds.setServerName("localhost")
  ds.setUser("arajeev")
  ds.setPassword("")
  ds.setDatabaseName("dp_datastore")

  private val dbi = new DBI(ds)
  private val collectionService = new CollectionService(new PgDataDDLImpl(dbi))

  val binding = Http().bindAndHandle(handler = collectionService.route, "localhost", 8000)
  binding onFailure {
    case ex: Exception ⇒
      ex.printStackTrace()
  }
  sys.addShutdownHook(actorSystem.terminate())
}
