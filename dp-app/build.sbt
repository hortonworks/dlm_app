name := """dp-app"""
version := "0.0.1-SNAPSHOT"
organization :="com.hortonworks.dataplane"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"
incOptions := incOptions.value.withNameHashing(true)
updateOptions := updateOptions.value.withCachedResolution(cachedResoluton = true)

libraryDependencies ++= {
  val ngVersion="2.2.0"
  Seq(
    cache,

    "org.reactivemongo" %% "play2-reactivemongo" % "0.12.0",
    "org.mindrot" % "jbcrypt" % "0.3m",
    "io.jsonwebtoken" % "jjwt" % "0.7.0",

    //service dependencies
    "com.hortonworks.dataplane" %% "db-client" % "0.1",
    "com.hw.dataplane" %% "atlas" % "1.0"

  )
}

routesGenerator := InjectedRoutesGenerator