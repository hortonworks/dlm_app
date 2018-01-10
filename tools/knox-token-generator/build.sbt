name := """knox-token-generator"""

Common.settings
version := "1.0"
enablePlugins(JavaAppPackaging)
mainClass in Compile := Some("com.hortonworks.dataplane.bcrypter.BCrypterMain")

libraryDependencies ++= Seq(
  "org.mindrot" % "jbcrypt" % "0.3m",
  "com.typesafe.scala-logging" %% "scala-logging" % "3.7.2",
  "org.slf4j" % "slf4j-simple" % "1.7.25"
)
