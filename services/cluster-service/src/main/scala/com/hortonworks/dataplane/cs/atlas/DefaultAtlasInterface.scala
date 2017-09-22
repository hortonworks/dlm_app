/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.cs.atlas

import javax.ws.rs.core.Cookie

import com.google.common.base.Supplier
import com.hortonworks.dataplane.commons.domain.Atlas.{
  AtlasAttribute,
  AtlasEntities,
  AtlasSearchQuery,
  Entity
}
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.{
  HJwtToken,
  ClusterService => CS
}
import com.hortonworks.dataplane.cs.ClusterDataApi
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasClientV2
import org.apache.atlas.model.SearchFilter
import org.apache.atlas.model.instance.{AtlasEntity, AtlasEntityHeader}
import org.apache.atlas.model.lineage.AtlasLineageInfo.LineageDirection
import org.codehaus.jackson.map.ObjectMapper
import play.api.libs.json.{JsValue, Json}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

private[atlas] sealed case class ClientWrapper(clusterId: Long,
                                               api: AtlasClientV2,
                                               shouldUseToken: Boolean = false)

object ClientExtension {

  class ExtendedClient(api: AtlasClientV2) {
    def setToken(token: Option[String]): AtlasClientV2 =
      token
        .map { t =>
          api.setCookie(new Cookie(Constants.HJWT, t))
          api
        }
        .getOrElse {
          // Need to clear the cookie
          api.setCookie(new Cookie(Constants.HJWT, ""))
          api
        }
  }

  implicit def extendedClient(api: AtlasClientV2): ExtendedClient =
    new ExtendedClient(api)

}

class DefaultAtlasInterface(private val clusterId: Long,
                            private val config: Config,
                            private val atlasApiData: ClusterDataApi)
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

  private lazy val lowerCaseQueries =
    Try(config.getBoolean("dp.services.atlas.lower.case.queries"))
      .getOrElse(false)

  private lazy val filterDeletedEntities =
    Try(config.getBoolean("dp.services.atlas.filter.deleted.entities"))
      .getOrElse(true)

  private lazy val hiveBaseQuery =
    Try(config.getString("dp.services.atlas.hive.search.query.base"))
      .getOrElse("hive_table")

  private lazy val includedTypes =
    config.getStringList("dp.services.atlas.hive.accepted.types").asScala.toSet

  private val atlasApi =
    new AtlasApiSupplier(clusterId, config, atlasApiData).get()

  private def getApi(implicit hJwtToken: Option[HJwtToken]) = {
    import ClientExtension._
    for {
      a <- atlasApi
      t <- atlasApiData.getTokenForCluster(clusterId, hJwtToken)
      api <- Future.successful(a.api.setToken(t))
    } yield api

  }

  override def getHiveAttributes(
      implicit hJwtToken: Option[HJwtToken]): Future[Seq[AtlasAttribute]] = {
    log.info("Fetching hive attributes")
    getApi.map { api =>
      val entityDef = api.getEntityDefByName("hive_table")
      val attributeDefs = entityDef.getAttributeDefs
      attributeDefs.asScala.collect {
        case ad if includedTypes.contains(ad.getTypeName) =>
          AtlasAttribute(ad.getName, ad.getTypeName)
      }.toList ++ defaultAttributes
    }
  }

  override def findHiveTables(filters: AtlasSearchQuery)(
      implicit hJwtToken: Option[HJwtToken]): Future[AtlasEntities] = {
    log.info("Fetching hive tables")
    log.info(s"Search query -> $filters")
    // Get the query

    val query = s"$hiveBaseQuery ${Filters.query(filters, lowerCaseQueries)}"
    getApi.map { api =>
      val searchResult =
        if (filters.isPaged)
          api.dslSearchWithParams(query, filters.limit.get, filters.offset.get)
        else api.dslSearch(query)

      Option(searchResult.getEntities)
        .map { entityHeaders =>
          val entities = if (filterDeletedEntities) {
            entityHeaders.asScala.collect {
              case e if e.getStatus != AtlasEntity.Status.DELETED =>
                createEntityRep(e)
            }
          } else entityHeaders.asScala.map(createEntityRep)
          AtlasEntities(Option(entities.toList))
        }
        .getOrElse(AtlasEntities(None))
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

  override def getAtlasEntity(uuid: String)(
      implicit hJwtToken: Option[HJwtToken]): Future[JsValue] = {
    log.info(s"Get atlas entity uuid -> $uuid")

    getApi.map { api =>
      val entityWithExtInfo = api.getEntityByGuid(uuid)
      val jsonString = mapper.writeValueAsString(entityWithExtInfo)
      Json.parse(jsonString)
    }
  }

  override def getAtlasEntities(uuids: Iterable[String])(
      implicit hJwtToken: Option[HJwtToken]): Future[JsValue] = {
    log.info(s"Get atlas entities uuids -> $uuids")
    getApi.map { api =>
      val entityWithExtInfo = api.getEntitiesByGuids(uuids.toList.asJava)
      val jsonString = mapper.writeValueAsString(entityWithExtInfo)
      Json.parse(jsonString)
    }
  }

  override def getAtlasLineage(uuid: String, depth: Option[String])(
      implicit hJwtToken: Option[HJwtToken]): Future[JsValue] = {
    log.info(s"Get Lineage entity uuid -> $uuid depth -> $depth")
    for {
      api <- getApi
      depth <- Future.successful(depth.map(i => i.toInt).getOrElse(3))
      lineageInfo <- Future {
        api.getLineageInfo(uuid, LineageDirection.BOTH, depth)
      }
    } yield {
      Json.parse(mapper.writeValueAsString(lineageInfo))
    }
  }

  override def getAtlasTypeDefs(searchFilter: SearchFilter)(
      implicit hJwtToken: Option[HJwtToken]): Future[JsValue] = {
    log.info(s"Getting atlas type defs")
    getApi.map { api =>
      val jsonString =
        mapper.writeValueAsString(api.getAllTypeDefs(searchFilter))
      Json.parse(jsonString)
    }
  }
}

sealed class AtlasApiSupplier(clusterId: Long,
                              config: Config,
                              atlasApiData: ClusterDataApi)
    extends Supplier[Future[ClientWrapper]] {
  private val log = Logger(classOf[AtlasApiSupplier])

  override def get(): Future[ClientWrapper] = {
    log.info("Loading Atlas client from Supplier")
    for {
      f <- for {
        url <- atlasApiData.getAtlasUrl(clusterId)
        shouldUseToken <- atlasApiData.shouldUseToken(clusterId)
        client <- {
          if (shouldUseToken) {
            log.info(
              "The cluster is registered as Knox enabled, Basic auth will not be set up")
            log.info(
              "!!!Atlas will not work unless configured with Knox SSO.!!!")
            // The initial value is not important as this can be updated with the real token
            Future.successful(
              ClientWrapper(clusterId,
                            new AtlasClientV2(Array(url.toString),
                                              new Cookie(Constants.HJWT, "")),
                            true))

          } else {
            atlasApiData.getCredentials.map { c =>
              log.info(
                s"No Knox detected , setting up basic auth with credentials -> $c")
              ClientWrapper(clusterId,
                            new AtlasClientV2(Array(url.toString),
                                              Array(c.user.get, c.pass.get)))
            }
          }
        }
      } yield client
      // Make sure to complete
      c <- Future.successful(f)
    } yield c
  }
}
