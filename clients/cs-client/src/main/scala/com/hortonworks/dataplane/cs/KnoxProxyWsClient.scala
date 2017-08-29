
package com.hortonworks.dataplane.cs


import java.net.URL

import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.typesafe.config.Config
import play.api.libs.ws._


case class KnoxProxyWsRequest(private val request: WSRequest, private val fallback: String) {

  def withHeaders(token: Option[HJwtToken]) : WSRequest = {
    val wsRequest = token match {
      case Some(jwtToken) =>
        request.withHeaders(Constants.DPTOKEN -> jwtToken.token)
      case None =>  request
    }
    wsRequest.withHeaders(Constants.SERVICE_ENDPOINT ->  fallback)
  }

}

case class KnoxProxyWsClient(wrappedClient: WSClient, config: Config) {
  private def proxyUrl = config.getString("dp.services.proxy.service.uri")

  def url(urlString: String, clusterId: Long, serviceName:String): KnoxProxyWsRequest = {
    val url = new URL(urlString)
    val fallbackEndpoint = s"${url.getProtocol}://${url.getAuthority}"
    val fallbackPath = url.getPath
    val req = wrappedClient.url(s"$proxyUrl/cluster/$clusterId/service/${serviceName.toLowerCase}$fallbackPath")
    KnoxProxyWsRequest(req, fallbackEndpoint)
  }
}





