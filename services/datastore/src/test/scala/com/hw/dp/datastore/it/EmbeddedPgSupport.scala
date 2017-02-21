package com.hw.dp.datastore.it

import java.sql.DriverManager

import ru.yandex.qatools.embed.postgresql.PostgresStarter
import ru.yandex.qatools.embed.postgresql.config.PostgresConfig
import scala.collection.JavaConversions._

trait EmbeddedPgSupport {

  val name = "data_plane"
  val username = "admin"
  val password = "admin"

  // starting Postgres
  val runtime = PostgresStarter.getDefaultInstance
  val config = PostgresConfig.defaultWithDbName(name, username, password)

  config
    .getAdditionalInitDbParams
    .addAll(List(
        "-E",
        "UTF-8",
        "--locale=en_US.UTF-8",
        "--lc-collate=en_US.UTF-8",
        "--lc-ctype=en_US.UTF-8"))
  val exec = runtime.prepare(config)
  val process = exec.start

  // connecting to a running Postgres
  val url = s"jdbc:postgresql://${config.net().host()}:${config.net().port()}/${config.storage().dbName()}?currentSchema=public&user=${config.credentials().username()}&password=${config.credentials().password()}"
  val conn = DriverManager.getConnection(url)



  def stop = {
    conn.close()
    process.stop()
  }

}

