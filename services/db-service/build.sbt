name := """db-service"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"

resolvers += "Atlassian Repository" at "https://maven.atlassian.com/3rdparty/"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  "com.typesafe.play" %% "play-slick" % "2.1.0",
  "com.github.tminglei" %% "slick-pg" % "0.15.0-RC",
  "postgresql" % "postgresql" % "9.4.1208-jdbc42-atlassian-hosted",
  "org.mindrot" % "jbcrypt" % "0.3m",
  "com.github.tminglei" %% "slick-pg_play-json" % "0.15.0-RC",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test
).map(_.exclude("org.webjars", "amdefine"))

