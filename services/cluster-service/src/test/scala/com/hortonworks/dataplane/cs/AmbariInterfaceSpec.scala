package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.restmock.httpmock.when
import com.typesafe.config.ConfigFactory
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

  logger.info("started local server at 9999")
  protected val stop = server.startOnPort(9999)

  val appConfig = ConfigFactory.parseString("""dp.services.endpoints {
                                              |
                                              |  #Very specific to namenode since there is no way of knowing the protocol with the endpoint value
                                              |  namenode = [{"name":"hdfs-site","properties":[{"protocol":"http","name":"dfs.namenode.http-address"},{"protocol":"https","name":"dfs.namenode.https-address"},{"protocol":"rpc","name":"dfs.namenode.rpc-address"}]}]
                                              |
                                              |  hdfs = [{"name":"core-site","properties":[{"protocol":"hdfs","name":"fs.defaultFS"}]}]
                                              |
                                              |  hive = [{"name":"hive-interactive-site","properties":[{"protocol":"TCP","name":"hive.server2.thrift.port"}]}]
                                              |
                                              |}""".stripMargin)

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
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "somecluster",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test")),
      Credentials(Some("admin"),Some("admin")),appConfig)

    ambariInterface.ambariConnectionCheck.map { ac =>
      assert(ac.status)
      assert(ac.url.toString == "http://localhost:9999/api/v1/clusters/test")
    }

  }


  it should "discover atlas and its properties" in {

    val json  = Source.fromURL(getClass.getResource("/atlas.json")).mkString
    val atlasConfig = "/api/v1/clusters/test/configurations/service_config_versions"
    when get(atlasConfig) withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"ATLAS","is_current" ->"true") thenRespond(200,json)

    implicit val ws = AhcWSClient()
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "test",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test")),
      Credentials(Some("admin"),Some("admin")),appConfig)

    val atlas  = ambariInterface.getAtlas
    atlas.map { either =>
      assert(either.isRight)
      assert(either.right.get.restService.toString == "http://ashwin-dp-knox-test-1.novalocal:21000")
    }

  }

  it should "discover the namenode and its properties" in {

    val json  = Source.fromURL(getClass.getResource("/namenode.json")).mkString
    val hdfsJson  = Source.fromURL(getClass.getResource("/hdfs.json")).mkString
    val nameNodeConfig = "/api/v1/clusters/test/components/NAMENODE"
    when get nameNodeConfig withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond(200,json)
    when get "/api/v1/clusters/test/configurations/service_config_versions" withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"HDFS","is_current"->"true") thenRespond(200,hdfsJson)

    implicit val ws = AhcWSClient()
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "test",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test")),
      Credentials(Some("admin"),Some("admin")),appConfig)

    val atlas  = ambariInterface.getNameNodeStats
    atlas.map { either =>
      assert(either.isRight)
      assert(either.right.get.serviceEndpoint.size == 3)
      assert(either.right.get.props.isDefined == true)
      //verify the first one
      assert(either.right.get.serviceEndpoint(0).protocol == "http")
      assert(either.right.get.serviceEndpoint(0).host == "yusaku-beacon-1.c.pramod-thangali.internal")
      assert(either.right.get.serviceEndpoint(0).port == 50070)
      assert(either.right.get.serviceEndpoint(0).name == "dfs.namenode.http-address")
    }
  }


  it should "discover HDFS and its properties" in {

    val hdfsJson  = Source.fromURL(getClass.getResource("/hdfs.json")).mkString
    when get "/api/v1/clusters/test/configurations/service_config_versions" withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"HDFS","is_current"->"true") thenRespond(200,hdfsJson)

    implicit val ws = AhcWSClient()
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "test",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test")),
      Credentials(Some("admin"),Some("admin")),appConfig)

    val atlas  = ambariInterface.getHdfsInfo
    atlas.map { either =>
      assert(either.isRight)
      assert(either.right.get.serviceEndpoint.size == 1)
      assert(either.right.get.props.isEmpty)
      //verify the first one
      assert(either.right.get.serviceEndpoint(0).protocol == "hdfs")
      assert(either.right.get.serviceEndpoint(0).host == "yusaku-beacon-1.c.pramod-thangali.internal")
      assert(either.right.get.serviceEndpoint(0).port == 8020)
      assert(either.right.get.serviceEndpoint(0).name == "fs.defaultFS")
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
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "test",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test"))
      ,Credentials(Some("admin"),Some("admin")),appConfig)

    val atlas  = ambariInterface.getGetHostInfo
    atlas.map { either =>
      assert(either.isRight)
      assert(either.right.get.size == 1)
      assert(either.right.get(0).properties.isDefined)
    }

  }

   it should "discover knox properties from the cluster" in {
    val json  = Source.fromURL(getClass.getResource("/knox.json")).mkString
    val url = "/api/v1/clusters/test/configurations/service_config_versions"
    when get url withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"KNOX","is_current" ->"true") thenRespond(200,json)

    implicit val ws = AhcWSClient()
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "test",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test")),
      Credentials(Some("admin"),Some("admin")),appConfig)

    val atlas  = ambariInterface.getKnoxInfo
    atlas.map { either =>
      assert(either.isRight)
    }

  }

  it should "discover beacon endpoints from the cluster" in {
    val beaconprops  = Source.fromURL(getClass.getResource("/beaconconfig.json")).mkString
    val beaconHosts  = Source.fromURL(getClass.getResource("/beaconhost.json")).mkString
    val url = "/api/v1/clusters/test/configurations/service_config_versions"
    when get url withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"BEACON","is_current" ->"true") thenRespond(200,beaconprops)
    when get "/api/v1/clusters/test/host_components" withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond(200,beaconHosts)

    implicit val ws = AhcWSClient()
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "test",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test")),
      Credentials(Some("admin"),Some("admin")),appConfig)

    val beacon  = ambariInterface.getBeacon
    beacon.map { either =>
      assert(either.isRight)
    }
  }


  it should "discover hiveserver thrift endpoints from the cluster" in {
    val hiveconfig  = Source.fromURL(getClass.getResource("/hiveconfig.json")).mkString
    val hivehost  = Source.fromURL(getClass.getResource("/hivehosts.json")).mkString
    val url = "/api/v1/clusters/test/configurations/service_config_versions"
    when get url withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") withParams ("service_name"->"HIVE","is_current" ->"true") thenRespond(200,hiveconfig)
    when get "/api/v1/clusters/test/host_components" withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond(200,hivehost)

    implicit val ws = AhcWSClient()
    val ambariInterface = new AmbariClusterInterface(
      Cluster(name = "test",
        description = "somedescription",
        ambariurl = Some("http://localhost:9999/api/v1/clusters/test")),
      Credentials(Some("admin"),Some("admin")),appConfig)

    val beacon  = ambariInterface.getHs2Info
    beacon.map { either =>
      assert(either.isRight)
      assert(either.right.get.props.isEmpty)
      assert(either.right.get.serviceEndpoint.size == 1)
    }
  }



  override def afterEach = {
    server.reset
  }

  override def afterAll = {
    stop()
  }

}
