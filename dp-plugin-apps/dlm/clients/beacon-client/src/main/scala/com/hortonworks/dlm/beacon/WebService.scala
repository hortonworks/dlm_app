package com.hortonworks.dlm.beacon

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
    
    protected def httpHeaders : Map[String,String] = Map (
      CONTENT_TYPE -> TEXT,
      ACCEPT -> JSON
    )

  }

  trait BeaconClusterService extends ClientService {

    def listCluster(beaconEndpoint : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconEntityResponse]]
    def listClusterStatus(beaconEndpoint : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]]
    def createClusterDefinition(beaconEndpoint : String, clusterName : String, clusterDefinitionRequest : ClusterDefinitionRequest): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPairService extends ClientService {

    def listPairedClusters(beaconEndpoint : String): Future[Either[BeaconApiErrors, Seq[PairedCluster]]]
    def createClusterPair(beaconEndpoint : String, remoteClusterName : String): Future[Either[BeaconApiErrors, PostActionResponse]]
    def createClusterUnpair(beaconEndpoint : String, remoteClusterName : String): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPolicyService extends ClientService {

    def listPolicies(beaconEndpoint : String): Future[Either[BeaconApiErrors, Seq[PoliciesDetailResponse]]]
    def listPolicy(beaconEndpoint : String, policyName : String): Future[Either[BeaconApiErrors, PolicyDataResponse]]
    def listPolicyStatus(beaconEndpoint : String, policyName : String): Future[Either[BeaconApiErrors, PolicyStatusResponse]]
    def submitAndSchedulePolicy(beaconEndpoint : String, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest): Future[Either[BeaconApiErrors, PostActionResponse]]
    def submitPolicy(beaconEndpoint : String, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest): Future[Either[BeaconApiErrors, PostActionResponse]]
    def schedulePolicy(beaconEndpoint : String, policyName : String): Future[Either[BeaconApiErrors, PostActionResponse]]
    def suspendPolicy(beaconEndpoint : String, policyName : String): Future[Either[BeaconApiErrors, PostActionResponse]]
    def resumePolicy(beaconEndpoint : String, policyName : String): Future[Either[BeaconApiErrors, PostActionResponse]]
    def deletePolicy(beaconEndpoint : String, policyName : String): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPolicyInstanceService extends ClientService {
    def listPolicyInstances(beaconEndpoint : String, queryString: Map[String,String]): Future[Either[BeaconApiErrors, Seq[PolicyInstanceResponse]]]
    def listPolicyInstance(beaconEndpoint : String, policyName : String, queryString: Map[String,String]): Future[Either[BeaconApiErrors, Seq[PolicyInstanceResponse]]]
    def abortPolicyInstances(beaconEndpoint : String, policyName : String): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconEventService extends ClientService {
    def listEvents(beaconEndpoint : String, queryString: Map[String,String]): Future[Either[BeaconApiErrors, Seq[BeaconEventResponse]]]
  }

}