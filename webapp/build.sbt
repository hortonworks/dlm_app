import com.typesafe.sbt.packager.docker._

name := """data_plane"""
version := "0.1-alpha"
lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"
incOptions := incOptions.value.withNameHashing(true)
updateOptions := updateOptions.value.withCachedResolution(cachedResoluton = true)

libraryDependencies ++= {
  val ngVersion="2.2.0"
  Seq(
    cache,

    "org.reactivemongo" %% "play2-reactivemongo" % "0.12.0",
    "org.mindrot" % "jbcrypt" % "0.3m",
    "io.jsonwebtoken" % "jjwt" % "0.7.0",

    //service dependencies
    "com.hw.dataplane" %% "dpservice" % "0.5",
    "com.hw.dataplane" %% "atlas" % "1.0"

  )
}

routesGenerator := InjectedRoutesGenerator

dockerCommands := dockerCommands.value.map {
  case ExecCmd("ENTRYPOINT", args @ _*) => {
    val args1 = args :+ "-Dconfig.resource=docker.conf"
    ExecCmd("ENTRYPOINT", args1:_*)
  }
  case cmd => cmd
}
