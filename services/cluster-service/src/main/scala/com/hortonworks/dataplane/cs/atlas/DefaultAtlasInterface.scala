package com.hortonworks.dataplane.cs.atlas

import com.google.common.base.Supplier
import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasSearchQuery, Entity}
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => CS}
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasClientV2
import org.apache.atlas.model.SearchFilter
import org.apache.atlas.model.instance.AtlasEntityHeader
import org.apache.atlas.model.lineage.AtlasLineageInfo.LineageDirection
import org.codehaus.jackson.map.ObjectMapper
import play.api.libs.json.{JsValue, Json}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class DefaultAtlasInterface(private val clusterId: Long,
                            private val config: Config,
                            private val atlasApiData: AtlasApiData)
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

  private val atlasApi =
    new AtlasApiSupplier(clusterId, config, atlasApiData).get()

  override def getHiveAttributes: Future[Seq[AtlasAttribute]] = {
    log.info("Fetching hive attributes")
    atlasApi.map { api =>
      val entityDef = api.getEntityDefByName("hive_table")
      val attributeDefs = entityDef.getAttributeDefs
      attributeDefs.asScala.collect {
        case ad if includedTypes.contains(ad.getTypeName) =>
          AtlasAttribute(ad.getName, ad.getTypeName)
      }.toList ++ defaultAttributes
    }
  }

  override def findHiveTables(
      filters: AtlasSearchQuery): Future[AtlasEntities] = {
    log.info("Fetching hive tables")
    log.info(s"Search query -> $filters")
    // Get the query
    val query = s"$hiveBaseQuery ${Filters.query(filters)}"
    atlasApi.map { api =>
      val searchResult =
        if (filters.isPaged)
          api.dslSearchWithParams(query, filters.limit.get, filters.offset.get)
        else api.dslSearch(query)
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
    Entity(
      Option(e.getTypeName),
      Option(attributeAsString(e)),
      Option(e.getGuid),
      Option(e.getStatus.toString),
      Option(e.getDisplayText),
      Option(e.getClassificationNames.asScala),
      None,
      None
    )
  }

  private def attributeAsString(e: AtlasEntityHeader) = {
    e.getAttributes.asScala.collect {
      case (k, v) if Option(v).isDefined =>
        (k, v.toString)
    }.toMap

  }

  private val mapper = new ObjectMapper()

  override def getAtlasEntity(uuid: String): Future[JsValue] = {
    log.info(s"Get atlas entity uuid -> $uuid")
    atlasApi.map { api =>
      val entityWithExtInfo = api.getEntityByGuid(uuid)
      val jsonString = mapper.writeValueAsString(entityWithExtInfo)
      Json.parse(jsonString)
    }
  }

  override def getAtlasEntities(uuids: Iterable[String]): Future[JsValue] = {
    log.info(s"Get atlas entities uuids -> $uuids")
    atlasApi.map { api =>
      val entityWithExtInfo = api.getEntitiesByGuids(uuids.toList.asJava)
      val jsonString = mapper.writeValueAsString(entityWithExtInfo)
      Json.parse(jsonString)
    }
  }

  override def getAtlasLineage(uuid: String,
                               depth: Option[String]): Future[JsValue] = {
    log.info(s"Get Lineage entity uuid -> $uuid depth -> $depth")
    for {
      api <- atlasApi
      depth <- Future.successful(depth.map(i => i.toInt).getOrElse(3))
      lineageInfo <- Future {
        api.getLineageInfo(uuid, LineageDirection.BOTH, depth)
      }
    } yield {
      Json.parse(mapper.writeValueAsString(lineageInfo))
    }
  }

  override def getAtlasTypeDefs(searchFilter: SearchFilter): Future[JsValue] = {
    log.info(s"Getting atlas type defs")
    atlasApi.map { api =>
      val jsonString =
        mapper.writeValueAsString(api.getAllTypeDefs(searchFilter))
      Json.parse(jsonString)
    }
  }
}

sealed class AtlasApiSupplier(clusterId: Long,
                              config: Config,
                              atlasApiData: AtlasApiData)
    extends Supplier[Future[AtlasClientV2]] {
  private val log = Logger(classOf[AtlasApiSupplier])

  override def get(): Future[AtlasClientV2] = {
    log.info("Loading Atlas client from Supplier")
    for {
      f <- for {
        url <- atlasApiData.getAtlasUrl(clusterId)
        shouldUseToken <- atlasApiData.shouldUseToken(clusterId)
        client <- {
          if (shouldUseToken) {
            //TODO: Load an API client with token - placeholder for now
            atlasApiData.getCredentials.map { c =>
              new AtlasClientV2(Array(url.toString), Array(c.user.get,c.pass.get))
            }
          } else {
            atlasApiData.getCredentials.map { c =>
              new AtlasClientV2(Array(url.toString), Array(c.user.get,c.pass.get))
            }
          }
        }
      } yield client
      // Make sure to complete
      c <- Future.successful(f)
    } yield c
  }
}
