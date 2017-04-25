name := """dlm-app"""

organization :="com.hortonworks.dlm"
version := "1.0"
scalaVersion := "2.11.8"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

incOptions := incOptions.value.withNameHashing(true)
updateOptions := updateOptions.value.withCachedResolution(cachedResoluton = true)

libraryDependencies ++= Seq(
  cache,
  //service dependencies
  "io.jsonwebtoken" % "jjwt" % "0.7.0",
  "com.typesafe.play" % "play-json_2.11" % "2.6.0-M3",
  "com.hortonworks.dataplane" %% "db-client" % "1.0",
  "com.hortonworks.dlm" %% "beacon-client" % "1.0",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test

)

routesGenerator := InjectedRoutesGenerator

