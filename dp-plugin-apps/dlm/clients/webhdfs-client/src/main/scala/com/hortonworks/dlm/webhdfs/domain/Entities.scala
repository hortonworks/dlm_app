package com.hortonworks.dlm.webhdfs.domain

import play.api.libs.json.Json

object Entities {
  case class WebHdfsApiErrorDetails(exception: String, javaClassName: String, message: String)

  case class WebHdfsRemoteException(RemoteException: WebHdfsApiErrorDetails)

  case class WebHdfsApiError(code: Int, namenodeUrl: Option[String], error: Option[WebHdfsRemoteException] = None, message: Option[String] = None)
}

object JsonFormatters {
  import  com.hortonworks.dlm.webhdfs.domain.Entities._

  implicit val webHdfsApiErrorDetailsWrites = Json.writes[WebHdfsApiErrorDetails]
  implicit val webHdfsApiErrorDetailsReads = Json.reads[WebHdfsApiErrorDetails]
  
  implicit val webHdfsRemoteExceptionWrites = Json.writes[WebHdfsRemoteException]
  implicit val webHdfsRemoteExceptionReads = Json.reads[WebHdfsRemoteException]

  implicit val webHdfsApiErrorWrites = Json.writes[WebHdfsApiError]
  implicit val webHdfsApiErrorReads = Json.reads[WebHdfsApiError]
}
