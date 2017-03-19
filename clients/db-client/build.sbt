name := """db-client"""
organization :="com.hortonworks.dataplane"
version := "0.1"

scalaVersion := "2.11.7"

// Change this to another test framework if you prefer
libraryDependencies += "org.scalatest" %% "scalatest" % "2.2.4" % "test"
libraryDependencies +=  "com.hortonworks.dataplane" %% "dp-commons" % "0.5"

