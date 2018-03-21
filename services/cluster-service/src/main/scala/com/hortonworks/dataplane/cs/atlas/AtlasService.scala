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

import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasEntities, AtlasSearchQuery, Entity}
import com.hortonworks.dataplane.commons.domain.Constants.ATLAS
import com.hortonworks.dataplane.commons.domain.Entities.{Error, HJwtToken, WrappedErrorException}
import com.hortonworks.dataplane.cs.KnoxProxyWsClient
import com.typesafe.config.Config
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSAuthScheme, WSResponse}

import scala.concurrent.{Future, Promise}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success, Try}

class AtlasService @Inject()(val config: Config)(implicit ws: KnoxProxyWsClient) {

  private def httpHandler(res: WSResponse): JsValue = {
    res.status match {
      case 200 => res.json
      case _ => throw WrappedErrorException(Error(500, "Unexpected error", "cluster.http.atlas.generic"))
    }
  }

  import scala.collection.JavaConverters._
  private val defaultAttributes =
    config
      .getObjectList("dp.services.atlas.atlas.common.attributes")
      .asScala
      .map { it => Json.obj("name" -> it.toConfig.getString("name"), "dataType" -> it.toConfig.getString("dataType")) }
  private val lowerCaseQueries = Try(config.getBoolean("dp.services.atlas.lower.case.queries")).getOrElse(false)
  private val filterDeletedEntities = Try(config.getBoolean("dp.services.atlas.filter.deleted.entities")).getOrElse(true)
  private val hiveBaseQuery = Try(config.getString("dp.services.atlas.hive.search.query.base")).getOrElse("hive_table")
  private val includedTypes = config.getStringList("dp.services.atlas.hive.accepted.types").asScala.toSet
  private val defaultLimit = Try(config.getInt("atlas.query.records.default.limit")).getOrElse(10000)
  private val defaultOffset = Try(config.getInt("atlas.query.records.default.offset")).getOrElse(0)

  def query(urls: Set[String], clusterId: String, username: String, password: String, query: AtlasSearchQuery)(implicit token: Option[HJwtToken]): Future[AtlasEntities] = {
    val q = s"$hiveBaseQuery ${Filters.query(query, lowerCaseQueries)}"

    val buildKV: JsValue => Option[Map[String, String]] = (cEntity: JsValue) => {
      (cEntity \ "attributes")
        .asOpt[Map[String, JsValue]]
          .map {_.collect {
            case (key, value) if value.asOpt[String].isDefined => (key, value.as[String])
          }
      }
    }

    firstOf(
      urls,
      (url: String) =>
        ws.url(s"$url/api/atlas/v2/search/dsl}", clusterId.toLong, ATLAS)
        .withToken(token)
        .withAuth(username, password, WSAuthScheme.BASIC)
        .withHeaders(
          "Content-Type" -> "application/json",
          "Accept" -> "application/json"
        )
        .withQueryString("query" -> q, "offset" -> query.offset.getOrElse(defaultOffset).toString, "limit" -> query.limit.getOrElse(defaultLimit).toString)
        .get()
    )
    .map(httpHandler)
    .map { json =>
      //AtlasSearchResult: {entities: [AtlasEntityHeader]}

      (json \ "entities").validateOpt[Seq[JsValue]]
        .map { _.collect {
              case cEntity: JsValue if (filterDeletedEntities && (cEntity \ "status").as[String] != "DELETED") => Entity(
                typeName = (cEntity \ "TypeName").asOpt[String],
                attributes = buildKV(cEntity),
                guid = (cEntity \ "Guid").asOpt[String],
                status = (cEntity \ "Status").asOpt[String],
                displayText = (cEntity \ "DisplayText").asOpt[String],
                tags = (cEntity \ "ClassificationNames").asOpt[Seq[String]],
                datasetId = None,
                datasetName = None)
            }
          }
        .map(entities => AtlasEntities(Option(entities.toList)))
        .getOrElse(AtlasEntities(None))
        //AtlasEntities
    }

  }

  def getEntity(urls: Set[String], clusterId: String, username: String, password: String, guid: String)(implicit token: Option[HJwtToken]): Future[JsValue] = {
    firstOf(
      urls,
      (url: String) =>
        ws.url(s"$url/api/atlas/v2/entity/guid/$guid", clusterId.toLong, ATLAS)
          .withToken(token)
          .withAuth(username, password, WSAuthScheme.BASIC)
          .withHeaders("Accept" -> "application/json")
          .get()
    )
    .map(httpHandler)
    //AtlasEntityWithExtInfo > {entity: {AtlasEntity}}
  }

  def getEntities(urls: Set[String], clusterId: String, username: String, password: String, guids: Seq[String])(implicit token: Option[HJwtToken]): Future[JsValue] = {
    firstOf(
      urls,
      (url: String) =>
        ws.url(s"$url/api/atlas/v2/entity/bulk", clusterId.toLong, ATLAS)
          .withToken(token)
          .withAuth(username, password, WSAuthScheme.BASIC)
          .withHeaders("Accept" -> "application/json")
          .withQueryString(guids.map(guid => ("query", guid)): _*)
          .get()
    )
    .map(httpHandler)
    //AtlasEntitiesWithExtInfo > {entities: [{AtlasEntity}]}
  }

  def getTypes(urls: Set[String], clusterId: String, username: String, password: String, defType: String) (implicit token: Option[HJwtToken]): Future[JsValue] = {
    firstOf(
      urls,
      (url: String) =>
        ws.url(s"$url/api/atlas/v2/types/typedefs", clusterId.toLong, ATLAS)
          .withToken(token)
          .withAuth(username, password, WSAuthScheme.BASIC)
          .withQueryString("type" -> defType)
          .withHeaders("Accept" -> "application/json")
          .get()
    )
    .map(httpHandler)
    //AtlasTypesDef: {enumDefs: [], structDefs: {}, classificationDefs: [], entityDefs: []}
  }

  def getEntityTypes(urls: Set[String], clusterId: String, username: String, password: String, name: String)(implicit token: Option[HJwtToken]): Future[Seq[JsValue]] = {
    val typeOfDef = "entitydef"
    firstOf(
      urls,
      (url: String) =>
        ws.url(s"$url/api/atlas/v2/types/$typeOfDef/name/$name", clusterId.toLong, ATLAS)
          .withToken(token)
          .withAuth(username, password, WSAuthScheme.BASIC)
          .withHeaders("Accept" -> "application/json")
          .get()
    )
    .map(httpHandler)
    .map { json =>
      //AtlasEntityDef: {attributeDefs: [AtlasAttributeDef]}

      val attributes = (json \ "attributeDefs").as[Seq[JsValue]]
      //Seq[AtlasAttributeDef]

      val sAttributes =
        attributes
          .filter(cAttribute => includedTypes.contains((cAttribute \ "typeName").as[String]))
          .map(cAttribute => Json.obj("name" -> (cAttribute \ "name").as[String], "typeName" -> (cAttribute \ "typeName").as[String]))

      sAttributes.toList ++ defaultAttributes
      //Seq[AtlasAttribute(name: String, dataType: String)]: Seq[{name, typeName}]
    }
  }

  def getLineage(urls: Set[String], clusterId: String, username: String, password: String, guid: String, depth: Option[String])(implicit token: Option[HJwtToken]): Future[JsValue] = {
    firstOf(
      urls,
      (url: String) =>
        ws.url(s"$url/api/atlas/v2/lineage/$guid", clusterId.toLong, ATLAS)
          .withToken(token)
          .withAuth(username, password, WSAuthScheme.BASIC)
          .withQueryString("depth" -> depth.getOrElse(3).toString, "direction" -> "BOTH")
          .withHeaders("Accept" -> "application/json")
          .get()
    )
    .map(httpHandler)
    //AtlasLineageInfo: {baseEntityGuid, lineageDirection, lineageDepth, guidEntityMap, relations}
  }

  private def firstOf(urls: Set[String], fn: (String) => Future[WSResponse]) = {
    val p = Promise[WSResponse]()
    urls
      .zipWithIndex
      .foreach { case (url, index) =>
        fn(url)
          .onComplete {
            case Success(response) => p.trySuccess(response)
            case Failure(throwable) => if(index == urls.size) p.tryFailure(throwable)
          }
      }
    p.future
  }

}