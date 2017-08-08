/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dlm.webhdfs

import com.hortonworks.dlm.webhdfs.domain.Entities._
import com.hortonworks.dlm.webhdfs.domain.JsonFormatters._
import play.api.libs.json.{JsError, JsResult, JsSuccess, JsValue}
import play.api.libs.ws.WSResponse
import play.api.libs.ws.ahc.AhcWSResponse

import scala.concurrent.Future

object WebService {

  trait ClientService {

    protected def extractError(res: WSResponse,
                               f: WSResponse => JsResult[WebHdfsRemoteException]): WebHdfsApiError = {
      val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
      if (res.body.isEmpty)
        WebHdfsApiError(res.status, url)
      f(res).map(r => WebHdfsApiError(res.status,url,Some(r))).getOrElse(WebHdfsApiError(res.status, url))
    }

    protected def mapErrors(res: WSResponse) = {
      Left(extractError(res, r => r.json.validate[WebHdfsRemoteException]))
    }

    protected def urlPrefix(nameNodeEndpoint: String) : String = nameNodeEndpoint + "/webhdfs/v1"

  }

  trait FileService extends ClientService {
    def getFileOperationResult(endpoint : String, filePath: String, operation: String): Future[Either[WebHdfsApiError, JsValue]]
  }

}

