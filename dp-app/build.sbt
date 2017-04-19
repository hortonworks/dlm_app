name := """dp-app"""

Common.settings

incOptions := incOptions.value.withNameHashing(true)
updateOptions := updateOptions.value.withCachedResolution(cachedResoluton = true)

libraryDependencies ++= {
  val ngVersion="2.2.0"
  Seq(
    cache,

    "org.reactivemongo" %% "play2-reactivemongo" % "0.12.0",
    "org.mindrot" % "jbcrypt" % "0.3m",
    "io.jsonwebtoken" % "jjwt" % "0.7.0",
    "com.typesafe.play" % "play-json_2.11" % "2.6.0-M3"

    //service dependencies
//    "com.hortonworks.dataplane" %% "db-client" % "0.1",
//    "com.hw.dataplane" %% "atlas" % "1.0"

  )
}

routesGenerator := InjectedRoutesGenerator
