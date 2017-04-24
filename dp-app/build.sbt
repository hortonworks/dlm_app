name := """dp-app"""

Common.settings

incOptions := incOptions.value.withNameHashing(true)
updateOptions := updateOptions.value.withCachedResolution(cachedResoluton = true)

libraryDependencies ++= {
  val ngVersion="2.2.0"
  Seq(
    cache,

    "org.mindrot" % "jbcrypt" % "0.3m",
    "io.jsonwebtoken" % "jjwt" % "0.7.0",
    "com.typesafe.play" % "play-json_2.11" % "2.6.0-M3"

  )
}

routesGenerator := InjectedRoutesGenerator
