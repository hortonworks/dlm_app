
name := """beacon-client"""
version := "0.1"

organization :="com.hortonworks.dlm"

scalaVersion := "2.11.8"



libraryDependencies ++= Seq(
  // Uncomment to use Akka
  //"com.typesafe.akka" %% "akka-actor" % "2.3.11",
  // "com.typesafe.akka" %% "akka-testkit" % "2.3.11" % "test",
  "com.typesafe.play" % "play-ws_2.11" % "2.5.13",
  "com.typesafe.play" % "play-json_2.11" % "2.6.0-M3",
  "org.scalatest" %% "scalatest" % "2.2.4" % "test")

