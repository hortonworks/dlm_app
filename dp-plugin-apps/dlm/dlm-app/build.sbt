name := """dlm-app"""
organization :="com.hortonworks.dlm"
version := "0.0.1-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"
incOptions := incOptions.value.withNameHashing(true)
updateOptions := updateOptions.value.withCachedResolution(cachedResoluton = true)

libraryDependencies ++= Seq(
  cache,
  //service dependencies
  "io.jsonwebtoken" % "jjwt" % "0.7.0",
  "com.typesafe.play" % "play-json_2.11" % "2.6.0-M3",
  "com.hortonworks.dataplane" %% "db-client" % "0.1",
  "com.hortonworks.dlm" %% "beacon-client" % "0.1",

  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test

)

routesGenerator := InjectedRoutesGenerator

