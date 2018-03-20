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

package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Constants.ATLAS
import com.hortonworks.dataplane.commons.domain.Atlas.{AssetProperties, AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken, WrappedErrorException}
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.typesafe.config.Config
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AtlasServiceImpl(val config: Config)(implicit ws: KnoxProxyWsClient)
    extends AtlasService {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def httpHandler(res: WSResponse): JsValue = {
    case 200 => res.json
    case _ => throw WrappedErrorException(Error(500, "Something went wrong", "cluster.http.generic"))
  }

  override def listQueryAttributes(clusterId: String)(implicit token:Option[HJwtToken]): Future[Seq[AtlasAttribute]] = {
    ws.url(s"$url/cluster/$clusterId/atlas/hive/attributes", clusterId.toLong, ATLAS)
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(httpHandler)
      .map(json => (json \ "results" \ "data").validate[Seq[AtlasAttribute]].get)
  }

  override def searchQueryAssets(clusterId: String, filters: AtlasSearchQuery)(implicit token:Option[HJwtToken]): Future[AtlasEntities] = {
    ws.url(s"$url/cluster/$clusterId/atlas/hive/search", clusterId.toLong, ATLAS)
      .withToken(token)
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(filters))
      .map(httpHandler)
      .map(json => (json \ "results" \ "data").validate[AtlasEntities].get)
  }

  override def getAssetDetails(clusterId: String, atlasGuid: String)(implicit token:Option[HJwtToken]): Future[JsObject] = {
    ws.url(s"$url/cluster/$clusterId/atlas/guid/$atlasGuid", clusterId.toLong, ATLAS)
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(httpHandler)
      .map(json => (json \ "results" \ "data").as[JsObject])
  }

  def getAssetsDetails(clusterId: String, guids: Seq[String])(implicit token:Option[HJwtToken]): Future[AtlasEntities] = {
    ws.url(s"$url/cluster/$clusterId/atlas/guid", clusterId.toLong, ATLAS)
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .withQueryString(guids.map(guid => ("query", guid)): _*)
      .get()
      .map(httpHandler)
      .map { json =>
        val entities = (json \ "results" \ "data" \ "entities").validate[Seq[AssetProperties]].get.map(_.getEntity())
        AtlasEntities(Option(entities.toList))
      }
  }

  override def getTypeDefs(clusterId: String, defType:String) (implicit token:Option[HJwtToken]): Future[JsObject] = {
    ws.url(s"$url/cluster/$clusterId/atlas/typedefs/type/$defType", clusterId.toLong, ATLAS)
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(httpHandler)
      .map(json => (json \ "results" \ "data").as[JsObject])
  }

  override def getLineage(clusterId: String, atlasGuid: String, depth: Option[String]) (implicit token:Option[HJwtToken]): Future[JsObject] = {
    var lineageUrl = s"$url/cluster/$clusterId/atlas/$atlasGuid/lineage"
    if(depth.isDefined){
      lineageUrl = lineageUrl + s"?depth=${depth.get}"
    }
    ws.url(lineageUrl, clusterId.toLong, ATLAS)
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(httpHandler)
      .map(json => (json \ "results" \ "data").as[JsObject])
  }

}
