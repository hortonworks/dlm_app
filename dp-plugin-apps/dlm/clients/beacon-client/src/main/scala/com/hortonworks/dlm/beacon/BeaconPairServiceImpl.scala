/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dlm.beacon

import com.hortonworks.dataplane.cs.KnoxProxyWsClient
import com.hortonworks.dataplane.commons.domain.Constants.BEACON
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dlm.beacon.Exception.JsonException
import play.api.libs.ws.{WSAuthScheme, WSResponse}
import com.hortonworks.dlm.beacon.WebService.BeaconPairService
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconApiError, BeaconApiErrors, PairedCluster, PostActionResponse}
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.mvc.Results

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconPairServiceImpl(implicit ws: KnoxProxyWsClient) extends BeaconPairService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._
  
  private def mapToBeaconClusterResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "cluster").get.validate[Seq[PairedCluster]] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  override def listPairedClusters(beaconEndpoint : String, clusterId: Long)
                                 (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Seq[PairedCluster]]] = {
    val queryString = collection.immutable.HashMap("fields" -> "peers")
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/list", clusterId, BEACON).withHeaders(token)
      .withQueryString(queryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToBeaconClusterResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def createClusterPair(beaconEndpoint : String, clusterId: Long, remoteClusterName : String)
                                (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val queryString = collection.immutable.HashMap("remoteClusterName" -> remoteClusterName)
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/pair", clusterId, BEACON).withHeaders(token)
      .withQueryString(queryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
      }
  }

  override def createClusterUnpair(beaconEndpoint : String, clusterId: Long, remoteClusterName : String)
                                  (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val queryString = collection.immutable.HashMap("remoteClusterName" -> remoteClusterName)
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/unpair", clusterId, BEACON).withHeaders(token)
      .withQueryString(queryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
  
}
