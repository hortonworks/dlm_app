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
  def execute(knoxApiRequest: KnoxApiRequest): Future[WSResponse]

}

object KnoxApiExecutor {

  def apply(c: KnoxConfig, w: WSClient) = new KnoxApiExecutor {

    override val wSClient: WSClient = w
    override val config: KnoxConfig = c

    private val tokenUrl = config.tokenUrl

    private def wrapTokenIfUnwrapped(token: String): String =
      if (token.startsWith("hadoop-jwt")) token
      else s"${config.knoxCookieTokenName}=$token"

    def getKnoxApiToken(token: String) = {
      wSClient
        .url(tokenUrl)
        .withHeaders("Cookie" -> token,"Content-Type" -> "application/json","Accept" -> "application/json")
        .get()
        .map { res =>
          res.json.validate[TokenResponse].get
        }
    }

    def makeApiCall(tokenResponse: TokenResponse,
                    knoxApiRequest: KnoxApiRequest) = {
      val wSRequest = knoxApiRequest.request.withHeaders(
        ("Cookie", wrapTokenIfUnwrapped(tokenResponse.accessToken)))
      // issue the call
      knoxApiRequest.executor.apply(wSRequest)
    }

    override def execute(knoxApiRequest: KnoxApiRequest): Future[WSResponse] = {

      for {
        // First get the token
        tokenResponse <- getKnoxApiToken(
          wrapTokenIfUnwrapped(knoxApiRequest.token))
        // Use token to issue the complete request
        response <- makeApiCall(tokenResponse, knoxApiRequest)
      } yield response

    }
  }
}
