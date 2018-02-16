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

import com.hortonworks.dataplane.commons.domain.Entities.{Error, WrappedErrorException}
import com.hortonworks.dataplane.knox.Knox.{KnoxConfig, TokenResponse}
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BasicKnoxApiExecutor(c: KnoxConfig, w: WSClient) extends KnoxApiExecutor{

  override val wSClient: WSClient = w
  override val config: KnoxConfig = c

  protected val tokenUrl = config.tokenUrl

  def getKnoxApiToken(token: String):Future[TokenResponse] = {
    wSClient
      .url(tokenUrl)
      .withHeaders("Cookie" -> token,"Content-Type" -> "application/json","Accept" -> "application/json")
      .get()
      .map { res =>
        res.status match {
          case 200 => res.json.validate[TokenResponse].get
          case 302 => throw WrappedErrorException(Error(500, "Knox token or the certificate on cluster might be corrupted.", "cluster.ambari.knox.public-key-corrupted"))
          case 403 => throw WrappedErrorException(Error(403, "User does not have required rights. Please disable or configure Ranger to add roles or log-in as another user.", "cluster.ambari.knox.ranger-rights-unavailable"))
          case 404 => throw WrappedErrorException(Error(500, "Knox token topology is not validated and deployment descriptor is not created.", "cluster.ambari.knox.configuration-error"))
          case 500 => throw WrappedErrorException(Error(500, "Knox certificate on cluster might be corrupted.", "cluster.ambari.knox.public-key-corrupted"))
          case _ => throw WrappedErrorException(Error(500, s"Unknown error. Server returned ${res.status}", "cluster.ambari.knox.genric"))
        }
      }
  }

}

