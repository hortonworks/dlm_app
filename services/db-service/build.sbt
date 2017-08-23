name := """db-service"""

Common.settings

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  "com.typesafe.play" %% "play-slick" % "2.1.0",
  "com.github.tminglei" %% "slick-pg" % "0.15.0-RC",
  "org.postgresql" % "postgresql" % "42.1.4",
  "org.mindrot" % "jbcrypt" % "0.3m",
  "com.github.tminglei" %% "slick-pg_play-json" % "0.15.0-RC",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test
)

excludeDependencies += "org.webjars" % "amdefine"
