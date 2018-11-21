/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package com.hortonworks.dlm.beacon

import com.hortonworks.dataplane.commons.domain.Constants.BEACON
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.KnoxProxyWsClient
import com.hortonworks.dlm.beacon.WebService.BeaconCloudCredService
import com.hortonworks.dlm.beacon.domain.RequestEntities.{CloudCredRequest, S3CloudCredRequest, WASBCloudCredRequest}
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.{WSAuthScheme, WSResponse}
import play.api.libs.ws.ahc.AhcWSResponse

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconCloudCredServiceImpl()(implicit ws: KnoxProxyWsClient) extends BeaconCloudCredService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToCloudCredResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[CloudCredResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPostCloudCredResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[CloudCredPostResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToCloudCredRequest(cloudCredRequest : CloudCredRequest) = {
    cloudCredRequest.authtype match {
      case "AWS_ACCESSKEY" =>
        val s3CloudCredRequest = cloudCredRequest.asInstanceOf[S3CloudCredRequest]
        serializeObject(s3CloudCredRequest)
      case "WASB_ACCESSKEY" =>
        val wasbCloudCredRequest = cloudCredRequest.asInstanceOf[WASBCloudCredRequest]
        serializeObject(wasbCloudCredRequest)
    }
  }



  override def getCloudCred(beaconEndpoint : String, clusterId: Long, cloudCredId : String)
                         (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, CloudCredResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred/$cloudCredId", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToCloudCredResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listAllCloudCred(beaconEndpoint : String, clusterId: Long, queryString: Map[String,String])
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, CloudCredsBeaconResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred", clusterId, BEACON).withHeaders(token)
      .withQueryString(queryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(res => {
      res.status match {
        case 200 =>
          res.json.validate[CloudCredsResponse] match {
            case JsSuccess(result, _) => {
              Right(CloudCredsBeaconResponse(clusterId, beaconEndpoint, result))
            }
            case JsError(error) => {
              val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
              Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
            }
          }
        case _ => mapErrors(res)
      }
    }).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def createCloudCred(beaconEndpoint : String, clusterId: Long, cloudCredRequest : CloudCredRequest)
                                      (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, CloudCredPostResponse]] = {
    val requestData:String =  mapToCloudCredRequest(cloudCredRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(mapToPostCloudCredResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def updateCloudCred(beaconEndpoint : String, clusterId: Long, cloudCredId : String, cloudCredRequest : CloudCredRequest)
                            (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    val requestData:String =  mapToCloudCredRequest(cloudCredRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred/$cloudCredId", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .put(requestData)
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def deleteCloudCred(beaconEndpoint : String, clusterId: Long, cloudCredId : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred/$cloudCredId", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .delete()
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}
