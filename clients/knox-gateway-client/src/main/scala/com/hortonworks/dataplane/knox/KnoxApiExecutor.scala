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

  def getKnoxApiToken(token: String):Future[TokenResponse]

  protected def wrapTokenIfUnwrapped(token: String): String =
    if (token.startsWith("hadoop-jwt")) token
    else s"${config.knoxCookieTokenName}=$token"

   protected final def makeApiCall(tokenResponse: TokenResponse,
                  knoxApiRequest: KnoxApiRequest) = {
    val wSRequest = knoxApiRequest.request.withHeaders(
      ("Cookie", wrapTokenIfUnwrapped(tokenResponse.accessToken)))
    // issue the call
    knoxApiRequest.executor.apply(wSRequest)
  }

  def execute(knoxApiRequest: KnoxApiRequest): Future[WSResponse] = {

    for {
      // First get the token
      tokenResponse <- getKnoxApiToken(wrapTokenIfUnwrapped(knoxApiRequest.token.get))
      // Use token to issue the complete request
      response <- makeApiCall(tokenResponse, knoxApiRequest)
    } yield response

  }


}

object KnoxApiExecutor {
  def apply(c: KnoxConfig, w: WSClient) = new DefaultKnoxApiExecutor(c,w)
  def withExceptionHandling(c: KnoxConfig, w: WSClient) = new BasicKnoxApiExecutor(c, w)
  def withTokenCaching(c: KnoxConfig, w: WSClient) = new TokenCachingKnoxApiExecutor(c,w)
  def withTokenDisabled(c: KnoxConfig, w: WSClient) = new TokenDisabledKnoxApiExecutor(c,w)
}
