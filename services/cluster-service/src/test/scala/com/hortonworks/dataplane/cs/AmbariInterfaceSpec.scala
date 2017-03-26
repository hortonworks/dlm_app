package com.hortonworks.dataplane.cs

import java.net.URL

import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.restmock.httpmock.when
import org.scalatest._
import org.scalatest.concurrent.ScalaFutures
import play.api.libs.ws.ahc.AhcWSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.io.Source

class AmbariInterfaceSpec
    extends AsyncFlatSpec
    with Matchers
    with ServerSupport
    with BeforeAndAfterEach
    with BeforeAndAfterAll with ScalaFutures {

  "AmbariInterface" should "call the default cluster endpoint" in {
    when get ("/api/v1/clusters") withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond (200, """{
                                                                                                          |  "href" : "http://172.22.72.9:8080/api/v1/clusters",
                                                                                                          |  "items" : [
                                                                                                          |    {
                                                                                                          |      "href" : "http://172.22.72.9:8080/api/v1/clusters/test",
                                                                                                          |      "Clusters" : {
                                                                                                          |        "cluster_name" : "test",
                                                                                                          |        "version" : "HDP-2.6"
                                                                                                          |      }
                                                                                                          |    }
                                                                                                          |  ]
                                                                                                          |}""")
    implicit val ws = AhcWSClient()
    val ambariInterface = new SimpleAmbariInterfaceImpl(
      Cluster(name = "somecluster",
        description = "somedescription",
        ambariUrl = Some("http://localhost:9999"),
        ambariuser = Some("admin"),
        ambaripass = Some("admin")))

    ambariInterface.ambariConnectionCheck.map { ac =>
      assert(ac.status)
      assert(ac.url.toString == "http://localhost:9999")
    }

  }


  it should "discover atlas and its properties" in {

    val json  = Source.fromURL(getClass.getResource("/atlas.json")).mkString
    val atlasConfig = "/api/v1/clusters/test/configurations/service_config_versions"
    when get(atlasConfig) withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"ATLAS","is_current" ->"true") thenRespond(200,json)

    implicit val ws = AhcWSClient()
    val ambariInterface = new SimpleAmbariInterfaceImpl(
      Cluster(name = "test",
        description = "somedescription",
        ambariUrl = Some("http://localhost:9999"),
        ambariuser = Some("admin"),
        ambaripass = Some("admin")))

    val atlas  = ambariInterface.getAtlas
    atlas.map { either =>
      assert(either.isRight)
      assert(either.right.get.restService.toString == "http://ashwin-dp-knox-test-1.novalocal:21000")
    }

  }

  it should "discover the namenode and its properties" in {

    val json  = Source.fromURL(getClass.getResource("/namenode.json")).mkString
    val nameNodeConfig = "/api/v1/clusters/test/components/NAMENODE"
    when get(nameNodeConfig) withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond(200,json)

    implicit val ws = AhcWSClient()
    val ambariInterface = new SimpleAmbariInterfaceImpl(
      Cluster(name = "test",
        description = "somedescription",
        ambariUrl = Some("http://localhost:9999"),
        ambariuser = Some("admin"),
        ambaripass = Some("admin")))

    val atlas  = ambariInterface.getNameNodeStats
    atlas.map { either =>
      assert(either.isRight)
      assert(either.right.get.startTime == 1489956956063L)
      assert(either.right.get.totalFiles == 181)

    }
  }


  it should "discover the hosts and diskinfo from the cluster" in {
    val json  = Source.fromURL(getClass.getResource("/hosts.json")).mkString
    val detailjson  = Source.fromURL(getClass.getResource("/host_name.json")).mkString
    val hostsConfig = "/api/v1/clusters/test/hosts"
    val hostConfig = "/api/v1/clusters/test/hosts/ashwin-dp-knox-test-1.novalocal"
    when get(hostsConfig) withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond(200,json)
    when get(hostConfig) withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond(200,detailjson)

    implicit val ws = AhcWSClient()
    val ambariInterface = new SimpleAmbariInterfaceImpl(
      Cluster(name = "test",
        description = "somedescription",
        ambariUrl = Some("http://localhost:9999"),
        ambariuser = Some("admin"),
        ambaripass = Some("admin")))

    val atlas  = ambariInterface.getGetHostInfo
    atlas.map { either =>
      assert(either.isRight)
      assert(either.right.get.size == 1)
      assert(either.right.get(0).diskStats.isDefined)
      assert(either.right.get(0).diskStats.get.size ==2 )
    }

  }

  it should "discover the knox properties from the cluster" in {
    val json  = Source.fromURL(getClass.getResource("/knox.json")).mkString
    val url = "/api/v1/clusters/test/configurations/service_config_versions"
    when get(url) withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"KNOX","is_current" ->"true") thenRespond(200,json)

    implicit val ws = AhcWSClient()
    val ambariInterface = new SimpleAmbariInterfaceImpl(
      Cluster(name = "test",
        description = "somedescription",
        ambariUrl = Some("http://localhost:9999"),
        ambariuser = Some("admin"),
        ambaripass = Some("admin")))

    val atlas  = ambariInterface.getKnoxInfo
    atlas.map { either =>
      assert(either.isRight)
    }

  }



  override def afterEach = {
    server.reset
  }

  override def afterAll = {
    stop()
  }

}
