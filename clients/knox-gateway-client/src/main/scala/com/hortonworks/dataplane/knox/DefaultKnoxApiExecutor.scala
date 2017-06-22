package com.hortonworks.dataplane.knox

import com.hortonworks.dataplane.knox.Knox.{KnoxApiRequest, KnoxConfig, TokenResponse}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future

class DefaultKnoxApiExecutor(c: KnoxConfig, w: WSClient) extends KnoxApiExecutor{

  override val wSClient: WSClient = w
  override val config: KnoxConfig = c


  protected def getKnoxApiToken(token: String) = {
    wSClient
      .url(tokenUrl)
      .withHeaders("Cookie" -> token,"Content-Type" -> "application/json","Accept" -> "application/json")
      .get()
      .map { res =>
        res.json.validate[TokenResponse].get
      }
  }

}

