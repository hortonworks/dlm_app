name := """db-client"""

Common.settings

libraryDependencies += "org.scalatest" %% "scalatest" % "2.2.4" % "test"
libraryDependencies +=  "com.hortonworks.dataplane" %% "dp-commons" % "0.5"
libraryDependencies +=  "com.typesafe.scala-logging" %% "scala-logging" % "3.5.0"