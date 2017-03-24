name := """cluster-service"""

version := "1.0"

scalaVersion := "2.11.6"

libraryDependencies ++= Seq(
  "com.hortonworks.dataplane" %% "db-client" % "0.1",
  "com.google.inject" % "guice" % "4.1.0",
  "com.typesafe.play" % "play-ws_2.11" % "2.5.13",
  "com.typesafe.akka" %% "akka-actor" % "2.3.11",
  "ch.qos.logback" % "logback-classic" % "1.1.7",
  "com.typesafe.scala-logging" %% "scala-logging" % "3.5.0",
  "com.typesafe.akka" %% "akka-testkit" % "2.3.11" % "test",
  "com.hortonworks.dataplane" %% "rest-mock" % "1.0" % "test",
  "org.scalatest" % "scalatest_2.11" % "3.0.1")
