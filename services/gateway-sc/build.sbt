name := """gateway-sc"""

Common.settings
version := "1.0"
enablePlugins(JavaAppPackaging)
mainClass in Compile := Some("com.hortonworks.dataplane.knoxagent.KnoxAgentMain")

libraryDependencies ++= Seq(
  "com.netflix.zuul" % "zuul-core" % "1.0.0"
)