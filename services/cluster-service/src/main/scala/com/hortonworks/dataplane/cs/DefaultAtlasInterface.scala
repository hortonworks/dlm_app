package com.hortonworks.dataplane.cs

import java.net.URL

import com.google.common.base.Supplier
import com.hortonworks.dataplane.commons.domain.Atlas.{
  AtlasAttribute,
  AtlasEntities,
  AtlasFilters,
  Entity
}
import com.hortonworks.dataplane.cs.atlas.Filters
import com.hortonworks.dataplane.db.Webserice.{
  ClusterComponentService,
  ClusterHostsService
}
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasClientV2
import org.apache.atlas.model.instance.AtlasEntityHeader

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class DefaultAtlasInterface(clusterId: Long,
                            storageInterface: StorageInterface,
                            clusterComponentService: ClusterComponentService,
                            clusterHostsService: ClusterHostsService,
                            config: Config)
    extends AtlasInterface {

  import scala.collection.JavaConverters._

  private val log = Logger(classOf[DefaultAtlasInterface])

  private val defaultAttributes = {
    val list =
      config.getObjectList("dp.services.atlas.atlas.common.attributes").asScala
    list.map { it =>
      AtlasAttribute(it.toConfig.getString("name"),
                     it.toConfig.getString("dataType"))
    }
  }

  val hiveBaseQuery =
    Try(config.getString("dp.services.atlas.hive.search.query.base"))
      .getOrElse("hive_table")

  val includedTypes =
    config.getStringList("dp.services.atlas.hive.accepted.types").asScala.toSet

  private val atlasApi = new AtlasApiSupplier(clusterId,
                                              storageInterface,
                                              clusterComponentService,
                                              clusterHostsService).get()

  override def getHiveAttributes: Future[Seq[AtlasAttribute]] = {
    atlasApi.map { api =>
      val entityDef = api.getEntityDefByName("hive_table")
      val attributeDefs = entityDef.getAttributeDefs
      attributeDefs.asScala.collect {
        case ad if includedTypes.contains(ad.getTypeName) =>
          AtlasAttribute(ad.getName, ad.getTypeName)
      }.toList ++ defaultAttributes
    }
  }

  override def findHiveTables(filters: AtlasFilters): Future[AtlasEntities] = {
    // Get the query
    val query = s"$hiveBaseQuery ${Filters.query(filters)}"
    atlasApi.map { api =>
      val searchResult = api.dslSearch(query)
      val entityHeaders = searchResult.getEntities
      if (entityHeaders == null) {
        AtlasEntities(None)
      } else {
        val entities = entityHeaders.asScala.map { e =>
          createEntityRep(e)
        }
        AtlasEntities(Option(entities.toList))
      }
    }

  }

  private def createEntityRep(e: AtlasEntityHeader) = {
    Entity(Option(e.getTypeName),
           Option(attributeAsString(e)),
           Option(e.getGuid),
           Option(e.getStatus.toString),
           Option(e.getDisplayText))
  }

  private def attributeAsString(e: AtlasEntityHeader) = {
    e.getAttributes.asScala.collect {
      case (k, v) if Option(v).isDefined =>
        (k, v.toString)
    }.toMap

  }
}

sealed class AtlasApiSupplier(clusterId: Long,
                              storageInterface: StorageInterface,
                              clusterComponentService: ClusterComponentService,
                              clusterHostsService: ClusterHostsService)
    extends Supplier[Future[AtlasClientV2]] {
  private val log = Logger(classOf[AtlasApiSupplier])
  override def get(): Future[AtlasClientV2] = {

    log.info("Loading Atlas client from Supplier")
    for {
      atlas <- getUrlOrThrowException
      baseUrl <- extract(atlas, clusterId)
      user <- storageInterface.getConfiguration("dp.atlas.user")
      pass <- storageInterface.getConfiguration("dp.atlas.password")
    } yield {
      new AtlasClientV2(List(baseUrl).toArray, Array(user.get, pass.get))
    }
  }

  private def getUrlOrThrowException = {
    clusterComponentService.getServiceByName(clusterId, "ATLAS").map {
      case Right(service) =>
        //service.fullURL.get
        ""
      case Left(errors) =>
        throw new Exception(
          s"Could not get the service Url from storage - $errors")
    }
  }

  private def extract(url: String, clusterId: Long): Future[String] = {
    val fullUrl = new URL(url)
    clusterHostsService
      .getHostByClusterAndName(clusterId, fullUrl.getHost)
      .map {
        case Right(host) =>
          s"${fullUrl.getProtocol}://${host.ipaddr}:${fullUrl.getPort}"
        case Left(errors) =>
          throw new Exception(
            s"Cannot translate the hostname into an IP address $errors")
      }
  }

}
