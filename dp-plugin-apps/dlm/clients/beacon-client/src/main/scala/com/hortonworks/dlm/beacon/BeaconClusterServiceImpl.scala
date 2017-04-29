package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.Exception.JsonException
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.libs.json.{JsError, JsSuccess, Json}
import com.hortonworks.dlm.beacon.WebService.BeaconClusterService
import com.hortonworks.dlm.beacon.domain.RequestEntities._

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
          case JsError(error) => {
            throw new Exception(error.toString())
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToClusterDefinitionRequest(clusterDefinitionRequest:ClusterDefinitionRequest) = {
      "fsEndpoint = " + clusterDefinitionRequest.fsEndpoint +
      "\nbeaconEndpoint = " + clusterDefinitionRequest.beaconEndpoint +
      "\nname = " +  clusterDefinitionRequest.name +
      "\ndescription = " + clusterDefinitionRequest.description
  }


  override def listCluster(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconEntityResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/getEntity/$clusterName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToBeaconEntityResponse).recoverWith {
        case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
        case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def listClusterStatus(beaconUrl : String, clusterName: String): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/cluster/status/$clusterName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToBeaconClusterStatusResponse).recoverWith {
        case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
        case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def createClusterDefinition(beaconUrl : String, clusterName : String,
                                       clusterDefinitionRequest:ClusterDefinitionRequest) :
                                       Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToClusterDefinitionRequest(clusterDefinitionRequest)
    ws.url(s"$beaconUrl/api/beacon/cluster/submit/$clusterName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      )
      .post(requestData)
      .map(mapToPostActionResponse).recoverWith {
      case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
      case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }
}