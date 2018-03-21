import sbt.ExclusionRule

name := """cluster-service"""

version := "1.0"

scalaVersion := "2.11.6"

enablePlugins(JavaAppPackaging)

resolvers += "Private HW nexus" at "http://nexus-private.hortonworks.com/nexus/content/groups/public/"

mainClass in Compile := Some("com.hortonworks.dataplane.cs.ClusterService")

libraryDependencies ++= Seq(
  "com.google.inject" % "guice" % "4.1.0",
  "com.typesafe.play" % "play-ws_2.11" % "2.5.13",
  "com.typesafe.play" % "play-json_2.11" % "2.6.0-M3",
  "com.typesafe.akka" %% "akka-actor" % "2.3.11",
  "com.typesafe.akka" %% "akka-http" % "10.0.5",
  "ch.qos.logback" % "logback-classic" % "1.1.7",
  "com.typesafe.scala-logging" %% "scala-logging" % "3.5.0",
  "com.typesafe.akka" %% "akka-testkit" % "2.3.11" % "test",
  "com.hortonworks.dataplane" %% "rest-mock" % "1.0" % "test",
  "org.slf4j" % "log4j-over-slf4j" % "1.7.25",
  "org.scalatest" % "scalatest_2.11" % "3.0.1" % Test,
  "org.scalamock" %% "scalamock-scalatest-support" % "3.5.0" % Test)

libraryDependencies :=
  libraryDependencies.value
    .map(
      _.excludeAll(
        ExclusionRule("com.google.code.findbugs", "annotations"),
        ExclusionRule("org.xerial.snappy", "snappy-java")
      )
    )
