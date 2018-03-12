/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company and Hortonworks, Inc. or
 * an authorized affiliate or partner thereof, any use, reproduction, modification, redistribution, sharing, lending
 * or other exploitation of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dlm.beacon

import com.hortonworks.dataplane.commons.domain.Constants.BEACON
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.KnoxProxyWsClient
import com.hortonworks.dlm.beacon.WebService.BeaconCloudCredService
import com.hortonworks.dlm.beacon.domain.RequestEntities.CloudCredRequest
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
    "version = " + cloudCredRequest.version + "\n" +
     (cloudCredRequest.name match {
        case Some(name) => "name=" + name + "\n"
        case None => ""
      }) +
      (cloudCredRequest.provider match {
        case Some(provider) => "provider=" + provider + "\n"
        case None => ""
      }) +
       (cloudCredRequest.authtype match {
         case Some(authtype) => "authtype=" + authtype + "\n"
         case None => ""
       }) +
      (cloudCredRequest.`aws.access.key` match {
        case Some(s3AccessKey) => "aws.access.key=" + s3AccessKey + "\n"
        case None => ""
      }) +
      (cloudCredRequest.`aws.secret.key` match {
        case Some(s3SecretKey) => "aws.secret.key=" + s3SecretKey + "\n"
        case None => ""
      }) +
      (cloudCredRequest.`aws.encryption.key` match {
        case Some(s3EncryptionKey) => "aws.encryption.key=" + s3EncryptionKey
        case None => ""
      })
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
                            (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToCloudCredRequest(cloudCredRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred/$cloudCredId", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .put(requestData)
      .map(mapToPostActionResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def deleteCloudCred(beaconEndpoint : String, clusterId: Long, cloudCredId : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred/$cloudCredId", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .delete()
      .map(mapToPostActionResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}
