package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.db.Webservice.NotebookWorkspaceService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future

class NotebookWorkspaceServiceImpl(config: Config)(implicit ws: WSClient)
  extends NotebookWorkspaceService {

  import com.hortonworks.dataplane.commons.domain.Entities._

  import scala.concurrent.ExecutionContext.Implicits.global

  private def url = config.getString("dp.services.db.service.uri")

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(workspaceId: Long): Future[Either[Errors, Seq[NotebookWorkspace]]] = {
    ws.url(s"$url/workspaces/$workspaceId/notebooks")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToNotebooks)
  }

  override def create(notebookWorkspace: NotebookWorkspace): Future[Either[Errors, NotebookWorkspace]] = {
    ws.url(s"$url/workspaces/notebooks")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(notebookWorkspace))
      .map(mapToNotebook)
  }

  override def delete(notebookId: String): Future[Either[Errors, Int]] = {
    ws.url(s"$url/notebooks/${notebookId}")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .withBody(Json.obj())
      .delete()
      .map(mapToInt)
  }


  private def mapToInt(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").as[Int])
      case _ => mapErrors(res)
    }
  }

  private def mapToNotebooks(res: WSResponse): Either[Errors, Seq[NotebookWorkspace]] = {
    res.status match {
      case 200 => extractEntity[Seq[NotebookWorkspace]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[NotebookWorkspace].get })
      case 404 => Left(Errors(Seq(Error("404", "Resource not found"))))
      case _ => mapErrors(res)
    }
  }

  private def mapToNotebook(res: WSResponse): Either[Errors, NotebookWorkspace] = {
    res.status match {
      case 200 => Right((res.json \ "results" \\ "data").head.validate[NotebookWorkspace].get)
      case 404 => Left(Errors(Seq(Error("404", "Resource not found"))))
      case _ => mapErrors(res)
    }
  }
}
