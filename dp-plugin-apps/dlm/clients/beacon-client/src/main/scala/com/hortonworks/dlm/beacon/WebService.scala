/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dlm.beacon

import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.RequestEntities._
import play.api.http.MimeTypes.{JSON, TEXT}
import play.api.http.HeaderNames.{ACCEPT, CONTENT_TYPE}
import play.api.libs.json.{JsError, JsResult, JsSuccess, Json}
import play.api.libs.ws.WSResponse
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.http.Status.BAD_GATEWAY

import scala.concurrent.Future

object WebService {

  trait ClientService {

    protected def extractEntity[T](res: WSResponse,
                                   f: WSResponse => T): Either[BeaconApiErrors, T] = {
      Right(f(res))
    }

    protected def extractError(res: WSResponse,
                               f: WSResponse => JsResult[BeaconApiError]): BeaconApiErrors = {
      val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
      if (res.body.isEmpty)
        BeaconApiErrors(res.status, url)
      f(res).map(r => BeaconApiErrors(res.status,url,Some(r))).getOrElse(BeaconApiErrors(res.status, url))
    }

    protected def mapErrors(res: WSResponse) = {
      Left(extractError(res, r => r.json.validate[BeaconApiError]))
    }

    protected def mapToPostActionResponse(res: WSResponse) = {
      res.status match {
        case 200 =>
          res.json.validate[PostActionResponse] match {
            case JsSuccess(result, _) => Right(result)
            case JsError(error) => {
              val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
              Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
            }
          }
        case _ => mapErrors(res)
      }
    }

    protected def urlPrefix(beaconEndpoint: String) : String = beaconEndpoint + "/api/beacon"
    protected val user = "admin"
    protected val password = "admin"
    
    protected def httpHeaders : Map[String,String] = Map (
      CONTENT_TYPE -> TEXT,
      ACCEPT -> JSON
    )

  }

  trait BeaconClusterService extends ClientService {

    def listCluster(beaconEndpoint : String, clusterId: Long, clusterName: String)
                   (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, BeaconEntityResponse]]
    def listClusterStatus(beaconEndpoint : String, clusterId: Long, clusterName: String)
                         (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]]
    def createClusterDefinition(beaconEndpoint : String, clusterId: Long, dataCenterClusterName : String, clusterDefinitionRequest : ClusterDefinitionRequest)
                               (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def deleteClusterDefinition(beaconEndpoint : String, clusterId: Long, dataCenterClusterName : String)
                               (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPairService extends ClientService {

    def listPairedClusters(beaconEndpoint : String, clusterId: Long)
                          (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Seq[PairedCluster]]]
    def createClusterPair(beaconEndpoint : String, clusterId: Long, remoteClusterName : String)
                         (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def createClusterUnpair(beaconEndpoint : String, clusterId: Long, remoteClusterName : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPolicyService extends ClientService {

    def listPolicies(beaconEndpoint : String, clusterId: Long, queryString: Map[String,String])
                    (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Seq[PoliciesDetailResponse]]]
    def listPolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                  (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyDataResponse]]
    def listPolicyStatus(beaconEndpoint : String, clusterId: Long, policyName : String)
                        (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyStatusResponse]]
    def submitAndSchedulePolicy(beaconEndpoint : String, clusterId: Long, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest)
                               (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def submitPolicy(beaconEndpoint : String, clusterId: Long, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest)
                    (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def schedulePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                      (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def suspendPolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                     (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def resumePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                    (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def deletePolicy(beaconEndpoint : String, clusterId: Long, policyName : String)
                    (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPolicyInstanceService extends ClientService {
    def listPolicyInstances(beaconEndpoint : String, clusterId: Long, queryString: Map[String,String])
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyInstancesDetails]]
    def listPolicyInstance(beaconEndpoint : String, clusterId: Long, policyName : String, queryString: Map[String,String])
                          (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PolicyInstancesDetails]]
    def abortPolicyInstances(beaconEndpoint : String, clusterId: Long, policyName : String)
                            (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
    def rerunPolicyInstance(beaconEndpoint : String, clusterId: Long, policyName : String)
                           (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconEventService extends ClientService {
    def listEvents(beaconEndpoint : String, clusterId: Long, queryString: Map[String,String])
                  (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, Seq[BeaconEventResponse]]]
  }

  trait BeaconLogService extends ClientService {
    def listLog(beaconEndpoint : String, clusterId: Long, queryString: Map[String,String])
               (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, BeaconLogResponse]]
  }

}