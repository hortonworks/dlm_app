package com.hortonworks.dataplane.cs

import java.net.URLEncoder

import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasFilter, AtlasFilters}
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterHost, ClusterService => AtlasService}
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService}
import com.hortonworks.dataplane.restmock.httpmock.when
import com.typesafe.config.ConfigFactory
import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{AsyncFlatSpec, BeforeAndAfterAll, BeforeAndAfterEach, Matchers}
import play.api.libs.json.Json

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

  private def setupMock = {

    val json =
      Source.fromURL(getClass.getResource("/atlasproperties.json")).mkString

    val storageInterface = mock[StorageInterface]
    (storageInterface.getConfiguration _)
      .expects("dp.atlas.user")
      .returns(Future.successful(Some("admin")))
    (storageInterface.getConfiguration _)
      .expects("dp.atlas.password")
      .returns(Future.successful(Some("admin")))

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
              Some(Json.parse(json))
              ))))

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
    (storageInterface, clusterComponentService, clusterHostsService)
  }



  "AtlasInterface" should "list attributes for hive" in {
    val (storageInterface: StorageInterface, clusterComponentService: ClusterComponentService, clusterHostsService: ClusterHostsService) = setupMock

    val json =
      Source.fromURL(getClass.getResource("/hiveattributes.json")).mkString

    when get ("/api/atlas/v2/types/entitydef/name/hive_table") withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=") thenRespond (200, json)

    val interface = new DefaultAtlasInterface(
      1L,
      storageInterface,
      clusterComponentService,
      clusterHostsService,
      ConfigFactory.parseString(
        """dp.services.atlas.hive.accepted.types=["string","int","long","boolean","date"]
          |dp.services.atlas.atlas.common.attributes=[{"name":"owner","dataType":"string"},{"name":"name","dataType":"string"}]
        """.stripMargin)
    )

    interface.getHiveAttributes.map { ha =>
      assert(ha.size == 10)
      assert(
        Set("name",
            "owner",
            "temporary",
            "tableType",
            "viewExpandedText",
            "viewOriginalText",
            "retention",
            "comment",
            "lastAccessTime",
            "createTime") == ha.map(_.name).toSet)
    }

  }

  it should "search for hive tables" in {
    val (storageInterface: StorageInterface, clusterComponentService: ClusterComponentService, clusterHostsService: ClusterHostsService) = setupMock

    val json =
      Source.fromURL(getClass.getResource("/atlassearch.json")).mkString

    when get ("/api/atlas/v2/search/dsl") withHeaders ("Authorization" -> "Basic YWRtaW46YWRtaW4=")  thenRespond (200, json)

    val interface = new DefaultAtlasInterface(
      1L,
      storageInterface,
      clusterComponentService,
      clusterHostsService,
      ConfigFactory.parseString(
        """dp.services.atlas.hive.accepted.types=["string","int","long","boolean","date"]
          |dp.services.atlas.atlas.common.attributes=[{"name":"owner","dataType":"string"},{"name":"name","dataType":"string"}]
        """.stripMargin)
    )

    interface.findHiveTables(AtlasFilters(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin")))).map { s =>
      assert(true)
    }

  }

  override def afterEach = {
    server.reset
  }

  override def afterAll = {
    stop()
  }

}
