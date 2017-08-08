/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
