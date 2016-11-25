name := """weatherservice"""

version := "0.2"
organization :="com.hw.dataplane"

scalaVersion := "2.11.7"

// Change this to another test framework if you prefer
libraryDependencies += "com.hw.dataplane" %% "dpservice" % "0.5"
libraryDependencies += "org.scalatest" %% "scalatest" % "2.2.4" % "test"


// Uncomment to use Akka
//libraryDependencies += "com.typesafe.akka" %% "akka-actor" % "2.3.11"

