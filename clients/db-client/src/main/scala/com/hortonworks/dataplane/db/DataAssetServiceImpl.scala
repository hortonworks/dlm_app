package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Atlas.EntityDatasetRelationship
import com.hortonworks.dataplane.commons.domain.Entities.Errors
import com.hortonworks.dataplane.db.Webservice.DataAssetService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class DataAssetServiceImpl(config: Config)(implicit ws: WSClient)
  extends DataAssetService {

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

  private def mapToEntityDatasetRelationship(res: WSResponse): Either[Errors, Seq[EntityDatasetRelationship]] = {
    res.status match {
      case 200 => extractEntity[Seq[EntityDatasetRelationship]](res, r => (r.json \ "results").validate[Seq[EntityDatasetRelationship]].get)
      case _ => mapErrors(res)
    }
  }

}
