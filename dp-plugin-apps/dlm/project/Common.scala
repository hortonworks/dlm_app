import sbt._
import Keys.{version, _}

object Common {

  val settings: Seq[Setting[_]] = Seq(
    organization :="com.hortonworks.dlm",
    version := "1.0",
    scalaVersion := "2.11.8"
  )

}
