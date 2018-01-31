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

  private def mapToCloudCredsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[CloudCredsResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

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
     (cloudCredRequest.name match {
        case Some(name) => "name = " + name
        case None => ""
      }) +
      (cloudCredRequest.provider match {
        case Some(provider) => "\nprovider = " + provider
        case None => ""
      }) +
      (cloudCredRequest.`s3.access.key` match {
        case Some(s3AccessKey) => "\ns3.access.key = " + s3AccessKey
        case None => ""
      }) +
      (cloudCredRequest.`s3.secret.key` match {
        case Some(s3SecretKey) => "\ns3.secret.key = " + s3SecretKey
        case None => ""
      }) +
      (cloudCredRequest.`s3.encryption.key` match {
        case Some(s3EncryptionKey) => "\ns3.encryption.key = " + s3EncryptionKey
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
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, CloudCredsResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cloudcred", clusterId, BEACON).withHeaders(token)
      .withQueryString(queryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToCloudCredsResponse).recoverWith {
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
      .post(requestData)
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
