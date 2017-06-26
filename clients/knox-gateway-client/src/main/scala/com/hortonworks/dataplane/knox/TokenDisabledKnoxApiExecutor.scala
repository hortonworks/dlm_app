package com.hortonworks.dataplane.knox

import com.hortonworks.dataplane.knox.Knox.{
  KnoxApiRequest,
  KnoxConfig,
  TokenResponse
}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future

/**
  * An executor which does not use a token
  * This class does not do much, but is useful to provide a
  * consistent API to callers
  *
  * @param c - Knox configuration
  * @param w - Webservice client
  */
class TokenDisabledKnoxApiExecutor(c: KnoxConfig, w: WSClient)
    extends KnoxApiExecutor {

  override val wSClient: WSClient = w
  override val config: KnoxConfig = c

  protected def getKnoxApiToken(token: String): Future[TokenResponse] = ???

  override def execute(knoxApiRequest: KnoxApiRequest): Future[WSResponse] = {
    val wSRequest = knoxApiRequest.request
    knoxApiRequest.executor.apply(wSRequest)
  }

}
