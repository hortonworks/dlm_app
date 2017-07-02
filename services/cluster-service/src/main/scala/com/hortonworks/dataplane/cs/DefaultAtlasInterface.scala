package com.hortonworks.dataplane.cs

import com.google.common.base.Supplier
import com.google.common.io.BaseEncoding
import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasSearchQuery, Entity}
import com.hortonworks.dataplane.commons.domain.Entities.{HJwtToken, ClusterService => CS}
import com.hortonworks.dataplane.cs.atlas.Filters
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

class DefaultAtlasInterface(clusterId: Long,token: Option[HJwtToken],
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

  private val atlasApi = new AtlasApiSupplier(clusterId,token,config).get()

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

  override def findHiveTables(filters: AtlasSearchQuery): Future[AtlasEntities] = {
    // Get the query
    val query = s"$hiveBaseQuery ${Filters.query(filters)}"
    atlasApi.map { api =>
      val searchResult = if(filters.isPaged) api.dslSearchWithParams(query,filters.limit.get,filters.offset.get) else api.dslSearch(query)
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
           Option(e.getDisplayText),
           Option(e.getClassificationNames.asScala),
           None,
           None)
  }

  private def attributeAsString(e: AtlasEntityHeader) = {
    e.getAttributes.asScala.collect {
      case (k, v) if Option(v).isDefined =>
        (k, v.toString)
    }.toMap

  }

  private val mapper = new ObjectMapper()

  override def getAtlasEntity(uuid: String): Future[JsValue] = {
    atlasApi.map { api =>
      val entityWithExtInfo = api.getEntityByGuid(uuid)
      val jsonString = mapper.writeValueAsString(entityWithExtInfo)
      Json.parse(jsonString)
    }
  }

  override def getAtlasEntities(uuids: Iterable[String]): Future[JsValue] = {
    atlasApi.map { api =>
      val entityWithExtInfo = api.getEntitiesByGuids(uuids.toList.asJava)
      val jsonString = mapper.writeValueAsString(entityWithExtInfo)
      Json.parse(jsonString)
    }
  }

  override def getAtlasLineage(uuid:String,depth:Option[String]):Future[JsValue] =  {
    for {
      api <- atlasApi
      depth <- Future.successful(depth.map(i => i.toInt).getOrElse(3))
      lineageInfo <- Future {
        api.getLineageInfo(uuid,LineageDirection.BOTH,depth)
      }
    } yield {
      Json.parse(mapper.writeValueAsString(lineageInfo))
    }
  }

  override def getAtlasTypeDefs(searchFilter: SearchFilter): Future[JsValue] = {
    atlasApi.map { api =>
      val jsonString = mapper.writeValueAsString(api.getAllTypeDefs(searchFilter))
      Json.parse(jsonString)
    }
  }
}

sealed class AtlasApiSupplier(clusterId: Long,token: Option[HJwtToken],config: Config)

    extends Supplier[Future[AtlasClientV2]] {
  private val log = Logger(classOf[AtlasApiSupplier])

  val host = Try(config.getString("dp.services.cluster.atlas.proxy.host")).getOrElse("0.0.0.0")
  val port = Try(config.getString("dp.services.cluster.atlas.proxy.port")).getOrElse("9010")

  /**
    * This part builds the proxy URL
    * if there was a token , then a URL safe B64 encoding
    * is applied to the token and its sent as a part of the URL
    * if None - NONE is token is attached
    *
    * The URL pattern is
    * ---------------fixed-----------cluster----fixed--token-fixed--atlas_api
    * Token - /atlas/proxy/cluster/<cluster_id>/token/<token>/url/<atlas_part>
    */

  private val tokenString = token.map(t => t.token).getOrElse("NONE")
  private val encoded = BaseEncoding.base64Url().omitPadding().encode(tokenString.getBytes)
  val proxyUrl=s"http://$host:$port/atlas/proxy/cluster/$clusterId/token/$encoded/url/"

  override def get(): Future[AtlasClientV2] = {
    log.info("Loading Atlas client from Supplier")
      Future.successful(
        // The basic auth is needed because the underlying
        // client code is silly
      new AtlasClientV2(Array(proxyUrl),Array("any","any")))

  }
}
