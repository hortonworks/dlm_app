/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.Exception.JsonException
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest, WSResponse}
import play.api.libs.json.{JsError, JsSuccess, Json}
import com.hortonworks.dlm.beacon.WebService.BeaconClusterService
import com.hortonworks.dlm.beacon.domain.RequestEntities._
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.ws.ahc.AhcWSResponse

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconClusterServiceImpl()(implicit ws: WSClient) extends BeaconClusterService {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._
  import com.hortonworks.dlm.beacon.domain.RequestEntities._

  private def mapToBeaconEntityResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[BeaconEntityResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToBeaconClusterStatusResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[BeaconClusterStatusResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToClusterDefinitionRequest(clusterDefinitionRequest:ClusterDefinitionRequest) = {
      "fsEndpoint = " + clusterDefinitionRequest.fsEndpoint +
      "\nbeaconEndpoint = " + clusterDefinitionRequest.beaconEndpoint +
      "\ndescription = " + clusterDefinitionRequest.description +
      (if (clusterDefinitionRequest.hsEndpoint.isDefined) "\nhsEndpoint = " + clusterDefinitionRequest.hsEndpoint.get else "")
  }


  override def listCluster(beaconEndpoint : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconEntityResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/getEntity/$clusterName")
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToBeaconEntityResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listClusterStatus(beaconEndpoint : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/status/$clusterName")
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToBeaconClusterStatusResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def createClusterDefinition(beaconEndpoint : String, dataCenterClusterName : String,
                                       clusterDefinitionRequest:ClusterDefinitionRequest) :
  Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToClusterDefinitionRequest(clusterDefinitionRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/submit/$dataCenterClusterName")
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}