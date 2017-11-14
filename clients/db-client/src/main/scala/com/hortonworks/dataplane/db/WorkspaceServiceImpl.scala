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

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.WorkspaceService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future

class WorkspaceServiceImpl(config: Config)(implicit ws: WSClient)
  extends WorkspaceService {

  import scala.concurrent.ExecutionContext.Implicits.global

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[WorkspaceDetails]]] = {
    ws.url(s"$url/workspacedetails")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToWorkspaceDetails)
  }

  override def create(workspace: Workspace): Future[Either[Errors, Workspace]] = {
    ws.url(s"$url/workspaces")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(workspace))
      .map(mapToWorkspace)
  }

  override def retrieve(name: String): Future[Either[Errors, WorkspaceDetails]] = {
    ws.url(s"$url/workspacedetails/name/$name")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get()
      .map(mapToWorkspaceDetail)
  }

  override def delete(name:String) : Future[Either[Errors, Int]] = {
    ws.url(s"$url/workspacedetails/name/$name")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .delete()
      .map(mapToInt)
  }

  private def mapToWorkspaces(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[Seq[Workspace]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[Workspace].get })
      case _ => mapErrors(res)
    }
  }

  private def mapToWorkspaceDetails(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[Seq[WorkspaceDetails]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[WorkspaceDetails].get })
      case _ => mapErrors(res)
    }
  }

  private def mapToWorkspaceDetail(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results" \ "data").validate[WorkspaceDetails].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToWorkspace(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results" \ "data").validate[Workspace].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToInt(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").as[Int])
      case _ => mapErrors(res)
    }
  }
}