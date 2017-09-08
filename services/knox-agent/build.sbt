name := """knox-agent"""

Common.settings
version := "1.0"
enablePlugins(JavaAppPackaging)
mainClass in Compile := Some("com.hortonworks.dataplane.knoxagent.KnoxAgentMain")

libraryDependencies ++= Seq(
  "com.typesafe.play" % "play-ws_2.11" % "2.5.13"

)

libraryDependencies := libraryDependencies.value.map(_.excludeAll(ExclusionRule("com.google.code.findbugs", "annotations")))