package com.hortonworks.dlm.beacon

import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import com.hortonworks.dlm.beacon.WebService.BeaconClusterPairService
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconApiError, BeaconApiErrors, PairedCluster, PostActionResponse}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.mvc.Results

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconClusterPairServiceImpl (implicit ws: WSClient) extends BeaconClusterPairService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._
  
  private def mapToBeaconClusterResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "cluster").get.validate[Seq[PairedCluster]] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => throw new Exception(error.toString())
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPostActionResponse(res: WSResponse) = {
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

  override def listPairedClusters(beaconUrl : String): Future[Either[BeaconApiErrors, Seq[PairedCluster]]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/list?fields=peers")
      .get.map(mapToBeaconClusterResponse).recoverWith {
      case e:Exception =>
        Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("500",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def createClusterPair(beaconUrl : String, remoteClusterName : String, remoteBeaconEndpoint: String): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/pair?remoteClusterName=$remoteClusterName&remoteBeaconEndpoint=$remoteBeaconEndpoint")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      )
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
      case e:Exception =>
        Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("500",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def createClusterUnpair(beaconUrl : String, remoteClusterName : String, remoteBeaconEndpoint: String): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/unpair?remoteClusterName=$remoteClusterName&remoteBeaconEndpoint=$remoteBeaconEndpoint")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      )
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
      case e:Exception =>
        Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("500",e.getMessage, Some(beaconUrl))))))
    }
  }
  
}
