package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.db.Webservice.AssetWorkspaceService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future

class AssetWorkspaceServiceImpl(config: Config)(implicit ws: WSClient)
  extends AssetWorkspaceService {

  import scala.concurrent.ExecutionContext.Implicits.global
  import com.hortonworks.dataplane.commons.domain.Entities._

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(workspaceId: Long): Future[Either[Errors, Seq[DataAsset]]] = {
    ws.url(s"$url/workspaces/$workspaceId/assets")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToAssets)
  }

  override def create(assetReq: AssetWorkspaceRequest): Future[Either[Errors, Seq[DataAsset]]] = {
    ws.url(s"$url/workspaces/assets")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(assetReq))
      .map(mapToAssets)
  }

  override def delete(workspaceId: Long): Future[Either[Errors, Int]] = ???

  private def mapToAssets(res: WSResponse): Either[Errors, Seq[DataAsset]] = {
    res.status match {
      case 200 => extractEntity[Seq[DataAsset]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[DataAsset].get })
      case 404 => Left(Errors(Seq(Error("404", "Resource not found"))))
      case _ => mapErrors(res)
    }
  }
}
