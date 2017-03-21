name := """cluster-service"""

version := "1.0"

scalaVersion := "2.11.6"

libraryDependencies ++= Seq(
  "com.hortonworks.dataplane" %% "db-client" % "0.1",
  "com.typesafe.akka" %% "akka-actor" % "2.3.11",
  "com.typesafe.akka" %% "akka-testkit" % "2.3.11" % "test",
  "org.scalatest" %% "scalatest" % "2.2.4" % "test")
