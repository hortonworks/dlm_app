package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import com.hortonworks.dataplane.commons.domain.Entities.{Errors}
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AtlasServiceImpl(config: Config)(implicit ws: WSClient)
    extends AtlasService {

  private def url =
    Option(System.getProperty("dp.services.cluster.service.uri"))
      .getOrElse(config.getString("dp.services.cluster.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  private def mapToAttributes(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[AtlasAttribute]](res, r =>
            (r.json \ "results" \ "data").validate[Seq[AtlasAttribute]].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToResults(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[AtlasEntities](res, r => (r.json \ "results" \ "data").validate[AtlasEntities].get)
      case _ => mapErrors(res)
    }
  }

  override def listQueryAttributes(clusterId: String): Future[Either[Errors, Seq[AtlasAttribute]]] = {
    ws.url(s"$url/cluster/$clusterId/atlas/hive/attributes")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToAttributes)
  }

  override def searchQueryAssets(clusterId: String, filters: AtlasSearchQuery): Future[Either[Errors, AtlasEntities]] = {
    ws.url(s"$url/cluster/$clusterId/atlas/hive/search")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(filters))
      .map(mapToResults)
  }


}
