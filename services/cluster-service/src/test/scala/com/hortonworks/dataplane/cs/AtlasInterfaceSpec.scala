package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities.{ClusterHost, ClusterService => AtlasService}
import com.hortonworks.dataplane.db.Webserice.{ClusterComponentService, ClusterHostsService}
import com.hortonworks.dataplane.restmock.httpmock.when
import com.typesafe.config.ConfigFactory
import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{AsyncFlatSpec, BeforeAndAfterAll, BeforeAndAfterEach, Matchers}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.io.Source

class AtlasInterfaceSpec
    extends AsyncFlatSpec
    with Matchers
    with ServerSupport
    with BeforeAndAfterEach
    with BeforeAndAfterAll
    with ScalaFutures
    with AsyncMockFactory {

  logger.info("started local server at 9998")
  protected val stop = server.startOnPort(9998)

  "AtlasInterface" should "list attributes for hive" in {
    val storageInterface = mock[StorageInterface]
    (storageInterface.getConfiguration _)
      .expects("dp.atlas.user")
      .returns(Future.successful(Some("admin")))
    (storageInterface.getConfiguration _)
      .expects("dp.atlas.password")
      .returns(Future.successful(Some("admin")))
    val json =
      Source.fromURL(getClass.getResource("/hiveattributes.json")).mkString
    val clusterComponentService = mock[ClusterComponentService]
    val clusterHostsService = mock[ClusterHostsService]
    (clusterComponentService.getServiceByName _)
      .expects(1, "ATLAS")
      .returns(
        Future.successful(
          Right(
            AtlasService(
              Some(1),
              "ATLAS",
              None,
              None,
              Some("http://ashwin-dp-knox-test-1.novalocal:9998")))))

    (clusterHostsService.getHostByClusterAndName _)
      .expects(1, "ashwin-dp-knox-test-1.novalocal")
      .returns(
        Future.successful(
          Right(
            ClusterHost(Some(1),
                        "ashwin-dp-knox-test-1.novalocal",
                        "localhost",
                        "A1",
                        None,
                        1))))

    when get ("/api/atlas/v2/types/entitydef/name/hive_table") withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond (200, json)

    val interface = new DefaultAtlasInterface(
      1L,
      storageInterface,
      clusterComponentService,
      clusterHostsService,
      ConfigFactory.parseString(
        "dp.services.atlas.hive.accepted.types=[\"string\",\"int\",\"long\",\"boolean\",\"date\"]")
    )

    interface.getHiveAttributes.map { ha =>
      assert(ha.size == 8)
      assert(
        Set("temporary",
            "tableType",
            "viewExpandedText",
            "viewOriginalText",
            "retention",
            "comment",
            "lastAccessTime",
            "createTime") == ha.map(_.name).toSet)
    }

  }

  override def afterEach = {
    server.reset
  }

  override def afterAll = {
    stop()
  }

}
