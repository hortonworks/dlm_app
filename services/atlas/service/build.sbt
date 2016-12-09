name := """atlas"""
organization := "com.hw.dp"
version := "1.0"

scalaVersion := "2.11.6"

resolvers += "mapr" at "http://repository.mapr.com/maven/"

libraryDependencies ++= Seq(
  "org.springframework.security.kerberos" % "spring-security-kerberos-client" % "1.0.1.RELEASE",
  "com.hw.dataplane" %% "dpservice" % "0.5",
  "org.scalatest" %% "scalatest" % "2.2.4" % "test")
