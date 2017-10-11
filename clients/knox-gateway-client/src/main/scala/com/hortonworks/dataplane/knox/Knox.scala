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

package com.hortonworks.dataplane.knox

import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSRequest, WSResponse}

import scala.concurrent.Future

object Knox {

  type ApiCall = (WSRequest) => Future[WSResponse]

  /**
    * @param request - The WS request to wrap the knox token with
    * @param executor - A function which applies this request - usually a GET,POST,PUT etc call
    * @param token - The jwt token from knox
    */
  case class KnoxApiRequest(request:WSRequest,executor: ApiCall, token: Option[String])

  /**
    *
    * @param tokenTopologyName - The name of the topology
    * @param knoxUrl - knox URL
    */
  case class KnoxConfig(tokenTopologyName: String,
                        knoxUrl: Option[String],
                        knoxCookieTokenName: String = "hadoop-jwt") {

    def tokenUrl =
      s"${knoxUrl.get}/gateway/$tokenTopologyName/knoxtoken/api/v1/token"
  }

  case class TokenResponse(accessToken: String,
                           targetUrl: Option[String],
                           tokenType: Option[String],
                           expires: Long)

  object TokenResponse {

    implicit val tokenResponseReads: Reads[TokenResponse] = (
      (JsPath \ "access_token").read[String] and
        (JsPath \ "target_url").readNullable[String] and
        (JsPath \ "token_type").readNullable[String] and
        (JsPath \ "expires_in").read[Long]
    )(TokenResponse.apply _)

  }

}
