name := """dp-commons"""

organization :="com.hortonworks.dataplane"
version := "0.5"

scalaVersion := "2.11.6"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor" % "2.3.11",
  "com.typesafe.akka" %% "akka-testkit" % "2.3.11" % "test",
  "com.typesafe.play" % "play-ws_2.11" % "2.5.10",
  "com.typesafe.play" % "play-json_2.11" % "2.5.10",
  "org.scalatest" %% "scalatest" % "2.2.4" % "test")
