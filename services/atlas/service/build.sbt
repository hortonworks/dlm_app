name := """atlas"""

Common.settings

resolvers += "mapr" at "http://repository.mapr.com/maven/"

libraryDependencies ++= Seq(
  "org.springframework.security.kerberos" % "spring-security-kerberos-client" % "1.0.1.RELEASE",
//  "com.hortonworks.dataplane" %% "dp-commons" % "0.5",
  "org.scalatest" %% "scalatest" % "2.2.4" % "test")
