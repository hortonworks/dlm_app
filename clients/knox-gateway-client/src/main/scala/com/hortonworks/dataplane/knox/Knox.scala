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
  case class KnoxApiRequest(request:WSRequest,executor: ApiCall, token: String)

  /**
    *
    * @param tokenTopologyName - The name of the topology
    * @param knoxUrl - knox URL
    */
  case class KnoxConfig(tokenTopologyName: String,
                        knoxUrl: String,
                        knoxCookieTokenName: String = "hadoop-jwt") {

    def tokenUrl =
      s"$knoxUrl/gateway/$tokenTopologyName/knoxtoken/api/v1/token"
  }

  case class TokenResponse(accessToken: String,
                           targetUrl: String,
                           tokenType: String,
                           expires: Long)

  object TokenResponse {

    implicit val tokenResponseReads: Reads[TokenResponse] = (
      (JsPath \ "access_token").read[String] and
        (JsPath \ "target_url").read[String] and
        (JsPath \ "token_type").read[String] and
        (JsPath \ "expires_in").read[Long]
    )(TokenResponse.apply _)

  }

}
