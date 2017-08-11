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
import com.hortonworks.dlm.beacon.WebService.BeaconPolicyInstanceService
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.libs.ws.{WSAuthScheme, WSResponse}
import play.api.mvc.Results

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class BeaconPolicyInstanceServiceImpl()(implicit ws: KnoxProxyWsClient) extends BeaconPolicyInstanceService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToPolicyInstanceResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[PolicyInstancesDetails] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }


  override def listPolicyInstances(beaconEndpoint : String, clusterId: Long, queryString: Map[String,String])
                                  (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyInstancesDetails]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/instance/list", clusterId, BEACON).withHeaders(token).withQueryString(queryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .get.map(mapToPolicyInstanceResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listPolicyInstance(beaconEndpoint : String, clusterId: Long, policyName : String, queryString: Map[String,String])
                                 (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyInstancesDetails]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/instance/list/$policyName", clusterId, BEACON).withHeaders(token).withQueryString(queryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .get.map(mapToPolicyInstanceResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def abortPolicyInstances(beaconEndpoint : String, clusterId: Long, policyName : String)
                                   (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/instance/abort/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent()).map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def rerunPolicyInstance(beaconEndpoint : String, clusterId: Long, policyName : String)
                                   (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/instance/rerun/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent()).map(mapToPostActionResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

}
