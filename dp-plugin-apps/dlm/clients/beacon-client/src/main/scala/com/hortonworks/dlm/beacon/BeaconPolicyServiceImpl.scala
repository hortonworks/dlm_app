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
import play.api.libs.ws.{WSAuthScheme, WSResponse}
import com.hortonworks.dlm.beacon.WebService.BeaconPolicyService
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import com.hortonworks.dlm.beacon.Exception.JsonException
import com.hortonworks.dlm.beacon.domain.RequestEntities.PolicyDefinitionRequest
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.mvc.Results

import scala.collection.immutable.HashMap
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconPolicyServiceImpl()(implicit ws: KnoxProxyWsClient) extends BeaconPolicyService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToPolicyDetailsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "policy").get.validate[Seq[PolicyDataResponse]] match {
          case JsSuccess(result, _) => Right(result.head)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPolicyStatusResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[PolicyStatusResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPoliciesDetailsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "policy").get.validate[Seq[PoliciesDetailResponse]] match {
          case JsSuccess(result, _) => Right(result)

          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPolicyDefinitionRequest(policyDefinitionRequest : PolicyDefinitionRequest) = {
    "name = " + policyDefinitionRequest.name +
    "\ntype = " + policyDefinitionRequest.`type` +
    "\nsourceDataset = " +  policyDefinitionRequest.sourceDataset +
    "\nsourceCluster = " + policyDefinitionRequest.sourceCluster +
    "\ntargetCluster = " + policyDefinitionRequest.targetCluster +
    "\nfrequencyInSec = " + policyDefinitionRequest.frequencyInSec +
      (policyDefinitionRequest.endTime match {
      case Some(endTime) => "\nendTime = " + endTime
      case None => ""
      }) +
      (policyDefinitionRequest.startTime match {
        case Some(startTime) => "\nstartTime = " + startTime
        case None => ""
      }) +
      (policyDefinitionRequest.distcpMaxMaps match {
        case Some(distcpMaxMaps) => "\ndistcpMaxMaps = " + distcpMaxMaps
        case None => ""
      }) +
      (policyDefinitionRequest.distcpMapBandwidth match {
        case Some(distcpMapBandwidth) => "\ndistcpMapBandwidth = " + distcpMapBandwidth
        case None => ""
      }) +
      (policyDefinitionRequest.queueName match {
        case Some(queueName) => "\nqueueName = " + queueName
        case None => ""
      }) +
      (policyDefinitionRequest.description match {
        case Some(description) => "\ndescription = " + description
        case None => ""
      })
  }



  override def listPolicyStatus(beaconEndpoint : String, clusterId: Long, policyName : String)
                               (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyStatusResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/status/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToPolicyStatusResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listPolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                         (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyDataResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/getEntity/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToPolicyDetailsResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listPolicies(beaconEndpoint : String, clusterId: Long, queryString: Map[String,String])
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Seq[PoliciesDetailResponse]]] = {
    val finalQueryString = queryString ++ HashMap("fields" -> "status,clusters,frequency,startTime,endTime,datasets,description,executionType,customProperties,instances,report",
                              "instanceCount" -> "10")
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/list", clusterId, BEACON).withHeaders(token)
      .withQueryString(finalQueryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToPoliciesDetailsResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def submitAndSchedulePolicy(beaconEndpoint : String, clusterId: Long, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest)
                                      (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToPolicyDefinitionRequest(policyDefinitionRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/submitAndSchedule/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def submitPolicy(beaconEndpoint : String, clusterId: Long, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToPolicyDefinitionRequest(policyDefinitionRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/submit/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(mapToPostActionResponse).recoverWith {
        case jsonException: JsonException => Future.successful(Left(BeaconApiErrors(BAD_GATEWAY, Some(beaconEndpoint), Some(BeaconApiError(jsonException.getMessage)))))
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def schedulePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                             (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/schedule/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def suspendPolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                            (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/suspend/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def resumePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/resume/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def deletePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/delete/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .delete()
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}
