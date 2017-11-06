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

package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Atlas.EntityDatasetRelationship
import com.hortonworks.dataplane.commons.domain.Entities.{DataAsset, Errors}
import com.hortonworks.dataplane.db.Webservice.DataAssetService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class DataAssetServiceImpl(config: Config)(implicit ws: WSClient)
  extends DataAssetService {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
    
  private def url = config.getString("dp.services.db.service.uri")

  override def findManagedAssets(clusterId:Long, assets: Seq[String]): Future[Either[Errors, Seq[EntityDatasetRelationship]]] = {
    ws.url(s"$url/dataassets/managedresults?clusterId=$clusterId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(assets))
      .map(mapToEntityDatasetRelationship)
  }

  def findAssetByGuid(guid: String): Future[Either[Errors, DataAsset]] = {
    ws.url(s"$url/dataassets/guid/$guid")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get()
      .map(mapToDataAsset)

  }

  private def mapToDataAsset(res: WSResponse): Either[Errors, DataAsset] = {
    res.status match {
      case 200 => extractEntity[DataAsset](res, r => (r.json \ "results" \ "data").validate[DataAsset].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToEntityDatasetRelationship(res: WSResponse): Either[Errors, Seq[EntityDatasetRelationship]] = {
    res.status match {
      case 200 => extractEntity[Seq[EntityDatasetRelationship]](res, r => (r.json \ "results").validate[Seq[EntityDatasetRelationship]].get)
      case _ => mapErrors(res)
    }
  }

}
