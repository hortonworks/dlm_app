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

package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import play.api.libs.ws._

case class ClusterWsRequest(private val wSRequest: WSRequest) {

  def withToken(hJwtToken: Option[HJwtToken]) = {
    hJwtToken match {
      case Some(jwtToken) =>
        wSRequest.withHeaders(Constants.DPTOKEN -> jwtToken.token)
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
