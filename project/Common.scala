import sbt._
import Keys.{version, _}

object Common {

  val settings: Seq[Setting[_]] = Seq(
    organization :="com.hortonworks.dataplane",
    version := "0.5",
    scalaVersion := "2.11.8"
  )

}