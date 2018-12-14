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

import com.hortonworks.dataplane.cs.KnoxProxyWsClient
import com.hortonworks.dataplane.commons.domain.Constants.BEACON
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import play.api.libs.ws.{WSAuthScheme, WSResponse}
import com.hortonworks.dlm.beacon.WebService.BeaconPolicyService
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import com.hortonworks.dlm.beacon.Exception.JsonException
import com.hortonworks.dlm.beacon.domain.RequestEntities.{PolicyDefinitionRequest, PolicyTestRequest, PolicyUpdateRequest}
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
      "\nfrequencyInSec = " + policyDefinitionRequest.frequencyInSec +
      (policyDefinitionRequest.targetDataset match {
        case Some(targetDataset) => "\ntargetDataset = " + targetDataset
        case None => ""
      }) +
      (policyDefinitionRequest.cloudCred match {
        case Some(cloudCred) => "\ncloudCred = " + cloudCred
        case None => ""
      }) +
      (policyDefinitionRequest.sourceCluster match {
        case Some(sourceCluster) => "\nsourceCluster = " + sourceCluster
        case None => ""
      }) +
      (policyDefinitionRequest.targetCluster match {
        case Some(targetCluster) => "\ntargetCluster = " + targetCluster
        case None => ""
      }) +
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
      (policyDefinitionRequest.`tde.sameKey` match {
        case Some(tdeSameKey) => "\ntde.sameKey = " + tdeSameKey
        case None => ""
      }) +
      (policyDefinitionRequest.description match {
        case Some(description) => "\ndescription = " + description
        case None => ""
      }) +
      (policyDefinitionRequest.enableSnapshotBasedReplication match {
        case Some(enableSnapshotBasedReplication) => "\nenableSnapshotBasedReplication = " + enableSnapshotBasedReplication
        case None => ""
      }) +
      (policyDefinitionRequest.`cloud.encryptionAlgorithm` match {
        case Some(cloudEncryptionAlgorithm) => "\ncloud.encryptionAlgorithm = " + cloudEncryptionAlgorithm
        case None => ""
      }) +
      (policyDefinitionRequest.`cloud.encryptionKey` match {
        case Some(cloudEncryptionKey) => "\ncloud.encryptionKey = " + cloudEncryptionKey
        case None => ""
      }) + (policyDefinitionRequest.plugins match {
        case Some(plugins) => "\nplugins = " + plugins
        case None => ""
      })
  }

  private def mapToPolicyUpdateRequest(policyUpdateRequest: PolicyUpdateRequest): String = {
    policyUpdateRequest.getClass.getDeclaredFields.foldLeft("") { (acc, field) =>
      field.setAccessible(true)
      field.get(policyUpdateRequest) match {
        case Some(value) => acc + s"${field.getName.replaceAll("\\$u002E", ".")}=${value}\n"
        case None => acc
      }
    }.stripLineEnd
  }

  private def mapToPolicyTestRequest(policyTestRequest : PolicyTestRequest) = {
    "type = " + policyTestRequest.`type` +
      (policyTestRequest.cloudCred match {
        case Some(cloudCred) => "\ncloudCred = " + cloudCred
        case None => ""
      }) +
      (policyTestRequest.sourceDataset match {
        case Some(sourceDataset) => "\nsourceDataset = " + sourceDataset
        case None => ""
      }) +
      (policyTestRequest.targetDataset match {
        case Some(targetDataset) => "\ntargetDataset = " + targetDataset
        case None => ""
      }) +
      (policyTestRequest.sourceCluster match {
        case Some(sourceCluster) => "\nsourceCluster = " + sourceCluster
        case None => ""
      }) +
      (policyTestRequest.targetCluster match {
        case Some(targetCluster) => "\ntargetCluster = " + targetCluster
        case None => ""
      }) +
      (policyTestRequest.`cloud.encryptionAlgorithm` match {
        case Some(cloudEncryptionAlgorithm) => "\ncloud.encryptionAlgorithm = " + cloudEncryptionAlgorithm
        case None => ""
      }) +
      (policyTestRequest.`cloud.encryptionKey` match {
        case Some(cloudEncryptionKey) => "\ncloud.encryptionKey = " + cloudEncryptionKey
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
    val finalQueryString = queryString ++ HashMap("fields" -> "status,clusters,frequency,creationTime,startTime,endTime,datasets,description,executionType,customProperties,instances,report",
                              "instanceCount" -> "10")
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/list", clusterId, BEACON).withHeaders(token)
      .withQueryString(finalQueryString.toList: _*)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToPoliciesDetailsResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def submitAndSchedulePolicy(beaconEndpoint : String, clusterId: Long, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest)
                                      (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    val requestData:String =  mapToPolicyDefinitionRequest(policyDefinitionRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/submitAndSchedule/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def updatePolicy(beaconEndpoint : String, clusterId: Long, policyName : String, policyUpdateRequest: PolicyUpdateRequest)
                                      (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    val requestData: String = mapToPolicyUpdateRequest(policyUpdateRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .put(requestData)
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def suspendPolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                            (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/suspend/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def resumePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/resume/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def deletePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/delete/$policyName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .delete()
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def testPolicy(beaconEndpoint : String, clusterId: Long, policyTestRequest : PolicyTestRequest)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionClusterResponse]] = {
    val requestData:String =  mapToPolicyTestRequest(policyTestRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/dryrun/${policyTestRequest.policyName}", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(x => mapToPostActionResponse(x, clusterId)).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}
