package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.Exception.JsonException
import com.hortonworks.dlm.beacon.WebService.BeaconPolicyInstanceService
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Results

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class BeaconPolicyInstanceServiceImpl()(implicit ws: WSClient) extends BeaconPolicyInstanceService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToPolicyInstanceResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "instance").get.validate[Seq[PolicyInstanceResponse]] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => throw new Exception(error.toString())
        }
      case _ => mapErrors(res)
    }
  }


  override def listPolicyInstances(beaconUrl : String, queryString: Map[String,String]) : Future[Either[BeaconApiErrors, Seq[PolicyInstanceResponse]]] = {
    ws.url(s"$beaconUrl/api/beacon/instance/list").withQueryString(queryString.toList: _*)
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToPolicyInstanceResponse).recoverWith {
      case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
      case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def listPolicyInstance(beaconUrl : String, policyName : String, queryString: Map[String,String]) : Future[Either[BeaconApiErrors, Seq[PolicyInstanceResponse]]] = {
    ws.url(s"$beaconUrl/api/beacon/policy/instance/list/$policyName").withQueryString(queryString.toList: _*)
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToPolicyInstanceResponse).recoverWith {
      case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
      case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def abortPolicyInstances(beaconUrl : String, policyName : String): Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/policy/instance/abort/$policyName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).post(Results.EmptyContent()).map(mapToPostActionResponse).recoverWith {
      case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
      case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }

}
