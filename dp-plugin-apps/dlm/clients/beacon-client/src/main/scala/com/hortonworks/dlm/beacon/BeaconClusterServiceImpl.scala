package com.hortonworks.dlm.beacon

import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.libs.json.{JsSuccess,JsError}
import com.hortonworks.dlm.beacon.WebService.BeaconClusterService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconClusterServiceImpl()(implicit ws: WSClient) extends BeaconClusterService {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToBeaconClusterResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[BeaconClusterResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => throw new Exception(error.toString())
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToBeaconEntityResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[BeaconEntityResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => throw new Exception(error.toString())
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToBeaconClusterStatusResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[BeaconClusterStatusResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => throw new Exception(error.toString())
        }
      case _ => mapErrors(res)
    }
  }

  override def listPairedClusters(beaconUrl : String): Future[Either[BeaconApiErrors, BeaconClusterResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/list?fields=peers,tags")
      .get.map(mapToBeaconClusterResponse).recoverWith {
      case e:Exception =>
        Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("500",e.getMessage)))))
    }
  }

  override def listCluster(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconEntityResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/getEntity/$clusterName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToBeaconEntityResponse).recoverWith {
      case e:Exception =>
        Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("500",e.getMessage)))))
    }
  }

  override def listClusterStatus(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/status/$clusterName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToBeaconClusterStatusResponse).recoverWith {
      case e:Exception =>
        Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("500",e.getMessage)))))
    }
  }
}