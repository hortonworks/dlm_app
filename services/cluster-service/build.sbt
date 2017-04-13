
name := """cluster-service"""

Common.settings

mainClass in assembly := Some("com.hortonworks.dataplane.cs.ClusterService")

libraryDependencies ++= Seq(
  "com.google.inject" % "guice" % "4.1.0",
  "com.typesafe.play" % "play-ws_2.11" % "2.5.13",
  "com.typesafe.akka" %% "akka-actor" % "2.3.11",
  "ch.qos.logback" % "logback-classic" % "1.1.7",
  "com.typesafe.scala-logging" %% "scala-logging" % "3.5.0",
  "com.typesafe.akka" %% "akka-testkit" % "2.3.11" % "test",
  "org.scalatest" % "scalatest_2.11" % "3.0.1")

excludeDependencies += "commons-logging" % "commons-logging"


assemblyMergeStrategy in assembly := {
  case PathList("META-INF", xs @ _*) =>
    (xs map {_.toLowerCase}) match {
      case ("io.netty.versions.properties" :: Nil) =>
        MergeStrategy.last
      case "services" :: xs =>
        MergeStrategy.filterDistinctLines
      case ("manifest.mf" :: Nil) | ("index.list" :: Nil) | ("dependencies" :: Nil) | ("license" :: Nil)
           | ("license.txt" :: Nil) | ("notice" :: Nil) | ("notice.txt" :: Nil) =>
        MergeStrategy.discard
      case ("MANIFEST.MF" :: Nil) | ("INDEX.LIST" :: Nil) | ("DEPENDENCIES" :: Nil) | ("LICENSE" :: Nil)
           | ("LICENSE.TXT" :: Nil) | ("NOTICE" :: Nil) | ("NOTICE.TXT" :: Nil) =>
        MergeStrategy.discard
      case _ => MergeStrategy.deduplicate
    }
  case x =>
    val oldStrategy = (assemblyMergeStrategy in assembly).value
    oldStrategy(x)
}