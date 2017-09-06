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

  def getKnoxApiToken(token: String): Future[TokenResponse] = ???

  override def execute(knoxApiRequest: KnoxApiRequest): Future[WSResponse] = {
    val wSRequest = knoxApiRequest.request
    knoxApiRequest.executor.apply(wSRequest)
  }

}
