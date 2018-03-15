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

import java.net.ConnectException
import javax.net.ssl.SSLException

import com.hortonworks.dataplane.commons.domain.Entities.{Error, WrappedErrorException}
import com.hortonworks.dataplane.knox.Knox.{KnoxConfig, TokenResponse}
import org.apache.commons.lang3.exception.ExceptionUtils
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
          case 302 => throw WrappedErrorException(Error(500, "Knox token or the certificate on cluster might be corrupted.", "cluster.ambari.status.knox.public-key-corrupted-or-bad-auth"))
          case 403 => throw WrappedErrorException(Error(403, "User does not have required rights. Please disable or configure Ranger to add roles or log-in as another user.", "cluster.ambari.status.knox.ranger-rights-unavailable"))
          case 404 => throw WrappedErrorException(Error(500, "Knox token topology is not validated and deployment descriptor is not created.", "cluster.ambari.status.knox.configuration-error"))
          case 500 => throw WrappedErrorException(Error(500, "Knox certificate on cluster might be corrupted.", "cluster.ambari.status.knox.public-key-corrupted"))
          case _ => throw WrappedErrorException(Error(500, s"Unknown error. Server returned ${res.status}", "cluster.ambari.status.knox.genric"))
        }
      }
      .recoverWith {
        case ex: SSLException => throw WrappedErrorException(Error(500, "TLS error. Please ensure your Knox server has been configured with a correct keystore. If you are using self-signed certificates, you would need to get it added to Dataplane truststore.", "cluster.ambari.status.knox.tls-error"))
        case ex: ConnectException if ExceptionUtils.indexOfThrowable(ex, classOf[SSLException]) >= 0 => throw WrappedErrorException(Error(500, "TLS error. Please ensure your Knox server has been configured with a correct keystore. If you are using self-signed certificates, you would need to get it added to Dataplane truststore.", "cluster.ambari.status.knox.tls-error"))
        case ex: ConnectException => throw WrappedErrorException(Error(500, "Connection to remote address was refused.", "cluster.ambari.status.knox.connection-refused"))
      }
  }

}

