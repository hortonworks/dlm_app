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

  override def list(): Future[Either[Errors, Seq[Workspace]]] = {
    ws.url(s"$url/workspaces")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToWorkspaces)
  }

  override def listWithCounts(): Future[Either[Errors, Seq[WorkspacesAndCounts]]] = {
    ws.url(s"$url/workspaceswithcounts")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToWorkspacesAndCount)
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

  private def mapToWorkspaces(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[Seq[Workspace]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[Workspace].get })
      case _ => mapErrors(res)
    }
  }

  private def mapToWorkspacesAndCount(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[Seq[WorkspacesAndCounts]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[WorkspacesAndCounts].get })
      case _ => mapErrors(res)
    }
  }

  private def mapToWorkspace(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results" \\ "data") (0).validate[Workspace].get)
      case _ => mapErrors(res)
    }
  }
}
