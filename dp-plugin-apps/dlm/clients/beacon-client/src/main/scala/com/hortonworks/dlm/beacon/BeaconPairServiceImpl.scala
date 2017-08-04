package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.Exception.JsonException
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest, WSResponse}
import com.hortonworks.dlm.beacon.WebService.BeaconPairService
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconApiError, BeaconApiErrors, PairedCluster, PostActionResponse}
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.mvc.Results

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconPairServiceImpl(implicit ws: WSClient) extends BeaconPairService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._
  
  private def mapToBeaconClusterResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "cluster").get.validate[Seq[PairedCluster]] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  override def listPairedClusters(beaconEndpoint : String): Future[Either[BeaconApiErrors, Seq[PairedCluster]]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/list?fields=peers")
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToBeaconClusterResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def createClusterPair(beaconEndpoint : String, remoteClusterName : String): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/pair?remoteClusterName=$remoteClusterName")
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
      }
  }

  override def createClusterUnpair(beaconEndpoint : String, remoteClusterName : String): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/unpair?remoteClusterName=$remoteClusterName")
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
  
}
