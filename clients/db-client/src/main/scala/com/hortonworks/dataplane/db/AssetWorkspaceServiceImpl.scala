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
