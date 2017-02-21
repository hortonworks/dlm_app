name := """datastore"""

version := "1.0"

scalaVersion := "2.11.6"

resolvers += Resolver.bintrayRepo("hseeberger", "maven")

resolvers += "Atlassian Repository" at "https://maven.atlassian.com/3rdparty/"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor" % "2.3.11",
  "com.typesafe.akka" %% "akka-http" % "10.0.3",
  "org.scalaz" %% "scalaz-core" % "7.2.8",
  "net.codingwell" %% "scala-guice" % "4.1.0",
  "com.typesafe.akka" %% "akka-testkit" % "2.3.11" % "test",
  "com.typesafe.play" %% "play-json" % "2.6.0-M1",
  "org.jdbi" % "jdbi" % "2.78",
  "postgresql" % "postgresql" % "9.4.1208-jdbc42-atlassian-hosted",
  "ru.yandex.qatools.embed" % "postgresql-embedded" % "1.20",
  "org.antlr" % "stringtemplate" % "3.2",
"org.scalatest" % "scalatest_2.11" % "3.0.1" % Test,
  "org.easymock" % "easymock" % "3.4" % Test)
