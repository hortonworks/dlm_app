import sbt._
import Keys._

object DataplaneBuild extends Build {

  lazy val common = Project(id = "dp-common",
                         base = file("dp-commons"))


  lazy val atlas = Project(id = "atlas",
                         base = file("services/atlas/service"))

  lazy val dbclient = Project(id = "dbclient", base = file("clients/db-client")) aggregate(common) dependsOn(common)

}
