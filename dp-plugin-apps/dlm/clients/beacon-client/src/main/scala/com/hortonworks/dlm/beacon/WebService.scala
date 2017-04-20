package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import play.api.libs.json.{JsResult, Json}
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

  }

  trait BeaconClusterService extends ClientService {

    def listPairedClusters(beaconUrl : String): Future[Either[BeaconApiErrors, BeaconClusterResponse]]
    def listCluster(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconEntityResponse]]
    def listClusterStatus(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]]
  }

}