package com.hortonworks.dataplane.cs

import java.net.URL

import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.Webservice.KnoxProxyService
import com.typesafe.config.Config
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  *
  * Client for the Knox proxy service
  *
  * This is the prescribed method of using the proxy
  * since it executes the call through the gateway
  * and sets up the headers correctly
  *
  * Example usage
  *<pre>
  * {@code
  * // Create a WS request
  * val req = ws.url(knoProxyService.getProxyUrl)
  * // Its possible to set any headers if needed
  * req.withHeaders("Authorization","Basic LJLKJKjljljlLHJKJKLJ==")
  * knoProxyService.execute(req, {req => req.get()},"http://dp-knox-sso-ashwin-1.novalocal:50070/webhdfs")
  * }
  * </pre>
  * @param config
  * @param ws - WsClient implementation
  */
class KnoxProxyServiceImpl(config: Config)(implicit ws: WSClient)
    extends KnoxProxyService {

  private def url =
    Option(System.getProperty("dp.services.proxy.service.uri"))
      .getOrElse(config.getString("dp.services.proxy.service.uri"))



  override def execute(request: WSRequest,
                       call: (WSRequest) => Future[WSResponse],
                       fallback: Option[String])(
      implicit token: Option[HJwtToken]): Future[WSResponse] = {

    // Modify the request to use the token
    val updatedRequest = token match {
      case Some(jwtToken) =>
        request.withHeaders(Constants.DPTOKEN -> jwtToken.token)
      case None =>
        // If the fallback was defined then it should be a valid URL
        if (fallback.isDefined)
          new URL(fallback.get)
        request.withHeaders(Constants.SERVICE_ENDPOINT -> fallback.get)
    }

    call(updatedRequest)

  }

  override def getProxyUrl: String = url
}
