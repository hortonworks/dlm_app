package com.hortonworks.dataplane.cs

import java.net.URL

import com.google.common.base.Supplier
import com.hortonworks.dataplane.commons.domain.Atlas.AtlasAttribute
import com.hortonworks.dataplane.db.Webserice.{ClusterComponentService, ClusterHostsService}
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasClientV2

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DefaultAtlasInterface(clusterId: Long,
                            storageInterface: StorageInterface,
                            clusterComponentService: ClusterComponentService,
                            clusterHostsService: ClusterHostsService,
                            config: Config)
    extends AtlasInterface {

  import scala.collection.JavaConverters._

  private val log = Logger(classOf[DefaultAtlasInterface])

  private val defaultAttributes = {
    val list = config.getObjectList("dp.services.atlas.atlas.common.attributes").asScala
    list.map { it =>
      AtlasAttribute(it.toConfig.getString("name"),it.toConfig.getString("dataType"))
    }
  }

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
        service.fullURL.get
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
