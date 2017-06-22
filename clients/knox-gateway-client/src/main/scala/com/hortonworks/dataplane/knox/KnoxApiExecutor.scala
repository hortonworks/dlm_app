package com.hortonworks.dataplane.knox

import Knox.{
  KnoxApiRequest,
  KnoxConfig,
  TokenResponse
}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

trait KnoxApiExecutor {
  val config: KnoxConfig
  val wSClient: WSClient

  protected val tokenUrl = config.tokenUrl

  protected def getKnoxApiToken(token: String)

  private def wrapTokenIfUnwrapped(token: String): String =
    if (token.startsWith("hadoop-jwt")) token
    else s"${config.knoxCookieTokenName}=$token"

  final def makeApiCall(tokenResponse: TokenResponse,
                  knoxApiRequest: KnoxApiRequest) = {
    val wSRequest = knoxApiRequest.request.withHeaders(
      ("Cookie", wrapTokenIfUnwrapped(tokenResponse.accessToken)))
    // issue the call
    knoxApiRequest.executor.apply(wSRequest)
  }

  def execute(knoxApiRequest: KnoxApiRequest): Future[WSResponse] = {

    for {
    // First get the token
      tokenResponse <- getKnoxApiToken(
        wrapTokenIfUnwrapped(knoxApiRequest.token))
      // Use token to issue the complete request
      response <- makeApiCall(tokenResponse, knoxApiRequest)
    } yield response

  }


}

object KnoxApiExecutor {
  def apply(c: KnoxConfig, w: WSClient) = new DefaultKnoxApiExecutor(c,w)
  // TODO Ashwin : Set up a executor which caches the token till its expiry
}
