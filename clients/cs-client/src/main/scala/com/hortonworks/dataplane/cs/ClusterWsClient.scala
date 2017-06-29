package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import play.api.libs.ws._

case class ClusterWsRequest(private val wSRequest: WSRequest) {

  def withToken(hJwtToken: Option[HJwtToken]) = {
    hJwtToken match {
      case Some(jwtToken) =>
        wSRequest.withHeaders("X-DP-Token-Info" -> jwtToken.token)
      case None => wSRequest
    }
  }

}

case class ClusterWsClient(wrappedClient: WSClient) {
  def url(url: String): ClusterWsRequest = {
    val req = wrappedClient.url(url)
    ClusterWsRequest(req)
  }
}
