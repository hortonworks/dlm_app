package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.RequestEntities._
import play.api.libs.json.{JsError, JsResult, JsSuccess, Json}
import play.api.libs.ws.WSResponse

import scala.concurrent.Future

object WebService {

  trait ClientService {

    protected def extractEntity[T](res: WSResponse,
                                   f: WSResponse => T): Either[BeaconApiErrors, T] = {
      Right(f(res))
    }

    protected def extractError(res: WSResponse,
                               f: WSResponse => JsResult[BeaconApiErrors]): BeaconApiErrors = {
      if (res.body.isEmpty)
        BeaconApiErrors()
      f(res).map(r => r).getOrElse(BeaconApiErrors())
    }

    protected def mapErrors(res: WSResponse) = {
      Left(extractError(res, r => r.json.validate[BeaconApiErrors]))
    }

    protected def mapToPostActionResponse(res: WSResponse) = {
      res.status match {
        case 200 =>
          res.json.validate[PostActionResponse] match {
            case JsSuccess(result, _) => Right(result)
            case JsError(error) => {
              throw new Exception(error.toString())
            }
          }
        case _ => mapErrors(res)
      }
    }

  }

  trait BeaconClusterService extends ClientService {

    def listCluster(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconEntityResponse]]
    def listClusterStatus(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]]
    def createClusterDefinition(beaconUrl : String, clusterName : String, clusterDefinitionRequest : ClusterDefinitionRequest): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPairService extends ClientService {

    def listPairedClusters(beaconUrl : String): Future[Either[BeaconApiErrors, Seq[PairedCluster]]]
    def createClusterPair(beaconUrl : String, remoteClusterName : String, remoteBeaconEndpoint: String): Future[Either[BeaconApiErrors, PostActionResponse]]
    def createClusterUnpair(beaconUrl : String, remoteClusterName : String, remoteBeaconEndpoint: String): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

  trait BeaconPolicyService extends ClientService {

    def listPolicies(beaconUrl : String): Future[Either[BeaconApiErrors, Seq[PoliciesDetailResponse]]]
    def listPolicy(beaconUrl : String, policyName : String): Future[Either[BeaconApiErrors, PolicyDataResponse]]
    def listPolicyStatus(beaconUrl : String, policyName : String): Future[Either[BeaconApiErrors, PolicyStatusResponse]]
   // def deletePolicy(beaconUrl : String): Future[Either[BeaconApiErrors, Seq[PairedCluster]]]
   // def updatePolicy(beaconUrl : String): Future[Either[BeaconApiErrors, Seq[PairedCluster]]]
   // def submitPolicy(beaconUrl : String, remoteClusterName : String, remoteBeaconEndpoint: String): Future[Either[BeaconApiErrors, PostActionResponse]]
   // def schedulePolicy(beaconUrl : String, remoteClusterName : String, remoteBeaconEndpoint: String): Future[Either[BeaconApiErrors, PostActionResponse]]
   // def submitAndSchedulePolicy(beaconUrl : String, remoteClusterName : String, remoteBeaconEndpoint: String): Future[Either[BeaconApiErrors, PostActionResponse]]
  }

}