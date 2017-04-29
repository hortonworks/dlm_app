package com.hortonworks.dlm.beacon

import play.api.libs.ws.{WSClient, WSResponse}
import com.hortonworks.dlm.beacon.WebService.BeaconPolicyService
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import com.hortonworks.dlm.beacon.Exception.JsonException
import play.api.libs.json.{JsError, JsSuccess}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconPolicyServiceImpl()(implicit ws: WSClient) extends BeaconPolicyService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToPolicyDetailsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[PolicyDataResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => throw new Exception(error.toString())
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPolicyStatusResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[PolicyStatusResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => throw new Exception(error.toString())
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPoliciesDetailsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "policy").get.validate[Seq[PoliciesDetailResponse]] match {
          case JsSuccess(result, _) => {
            Right(result)
          }
          case JsError(error) => {
            throw new JsonException(error.toString())
          }
        }
      case _ => {
        mapErrors(res)
      }
    }
  }
  

  override def listPolicyStatus(beaconUrl : String, policyName : String) : Future[Either[BeaconApiErrors, PolicyStatusResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/policy/status/$policyName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToPolicyStatusResponse).recoverWith {
      case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
      case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def listPolicy(beaconUrl : String, policyName : String) : Future[Either[BeaconApiErrors, PolicyDataResponse]] = {
    ws.url(s"$beaconUrl/api/beacon/policy/getEntity/$policyName")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToPolicyDetailsResponse).recoverWith {
      case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
      case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }

  override def listPolicies(beaconUrl : String) : Future[Either[BeaconApiErrors, Seq[PoliciesDetailResponse]]] = {
    ws.url(s"$beaconUrl/api/beacon/policy/list?fields=status,clusters,frequency,starttime,endtime")
      .withHeaders(
        "Content-Type" -> "text/plain",
        "Accept" -> "application/json"
      ).get.map(mapToPoliciesDetailsResponse).recoverWith {
      case jsonException:JsonException => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("502",jsonException.getMessage, None)))))
      case e:Exception => Future.successful(Left(BeaconApiErrors(Seq(BeaconApiError("503",e.getMessage, Some(beaconUrl))))))
    }
  }
}
