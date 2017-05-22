package com.hortonworks.dlm.webhdfs

import com.hortonworks.dlm.webhdfs.WebService.FileService
import com.hortonworks.dlm.webhdfs.domain.Entities._
import com.hortonworks.dlm.webhdfs.domain.JsonFormatters._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess, JsValue}
import play.api.libs.ws.ahc.AhcWSResponse

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class FileServiceImpl()(implicit ws: WSClient) extends FileService {


  private def mapToContentSummaryResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[ContentSummary] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(WebHdfsApiError(BAD_GATEWAY, url, None,Some(error.toString())))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToFileStatus(res: WSResponse) = {
    res.status match {
      case 200 => Right(res.json)
      case _ => mapErrors(res)
    }
  }

  private def mapToFileStatuses(res: WSResponse) = {
    res.status match {
      case 200 => Right(res.json)
      case _ => mapErrors(res)
    }
  }


  override def getFileOperationResult(nameNodeEndpoint: String, filePath: String, operation: String) : Future[Either[WebHdfsApiError, JsValue]] = {
    ws.url(s"${urlPrefix(nameNodeEndpoint)}$filePath").withQueryString("op" -> operation)
      .get.map(mapToFileStatuses).recoverWith {
      case e: Exception => Future.successful(Left(WebHdfsApiError(SERVICE_UNAVAILABLE, Some(nameNodeEndpoint), None, Some(e.getMessage))))
    }
  }
  
}
