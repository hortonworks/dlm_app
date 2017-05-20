package com.hortonworks.dlm.beacon

import play.api.libs.ws.{WSClient, WSResponse}
import com.hortonworks.dlm.beacon.WebService.BeaconPolicyService
import com.hortonworks.dlm.beacon.domain.ResponseEntities._
import com.hortonworks.dlm.beacon.Exception.JsonException
import com.hortonworks.dlm.beacon.domain.RequestEntities.PolicyDefinitionRequest
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.mvc.Results

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconPolicyServiceImpl()(implicit ws: WSClient) extends BeaconPolicyService {
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToPolicyDetailsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[PolicyDataResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPolicyStatusResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[PolicyStatusResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPoliciesDetailsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "policy").get.validate[Seq[PoliciesDetailResponse]] match {
          case JsSuccess(result, _) => Right(result)

          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToPolicyDefinitionRequest(policyDefinitionRequest : PolicyDefinitionRequest) = {
    "name = " + policyDefinitionRequest.name +
    "\ntype = " + policyDefinitionRequest.`type` +
    "\nsourceDataset = " +  policyDefinitionRequest.sourceDataset +
    "\nsourceCluster = " + policyDefinitionRequest.sourceCluster +
    "\ntargetCluster = " + policyDefinitionRequest.targetCluster +
    "\nfrequencyInSec = " + policyDefinitionRequest.frequencyInSec +
    (if (policyDefinitionRequest.endTime.isDefined) "\nendTime = " + policyDefinitionRequest.endTime.get) +
    (if (policyDefinitionRequest.startTime.isDefined) "\nstartTime = " + policyDefinitionRequest.startTime.get)
  }



  override def listPolicyStatus(beaconEndpoint : String, policyName : String) : Future[Either[BeaconApiErrors, PolicyStatusResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/status/$policyName")
      .get.map(mapToPolicyStatusResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listPolicy(beaconEndpoint : String, policyName : String) : Future[Either[BeaconApiErrors, PolicyDataResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/getEntity/$policyName")
      .get.map(mapToPolicyDetailsResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listPolicies(beaconEndpoint : String) : Future[Either[BeaconApiErrors, Seq[PoliciesDetailResponse]]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/list?fields=status,clusters,frequency,startTime,endTime")
      .get.map(mapToPoliciesDetailsResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def submitAndSchedulePolicy(beaconEndpoint : String, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToPolicyDefinitionRequest(policyDefinitionRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/submitAndSchedule/$policyName")
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def submitPolicy(beaconEndpoint : String, policyName : String, policyDefinitionRequest : PolicyDefinitionRequest) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToPolicyDefinitionRequest(policyDefinitionRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/submit/$policyName")
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(mapToPostActionResponse).recoverWith {
        case jsonException: JsonException => Future.successful(Left(BeaconApiErrors(BAD_GATEWAY, Some(beaconEndpoint), Some(BeaconApiError(jsonException.getMessage)))))
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def schedulePolicy(beaconEndpoint : String, policyName : String) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/schedule/$policyName")
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def suspendPolicy(beaconEndpoint : String, policyName : String) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/suspend/$policyName")
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def resumePolicy(beaconEndpoint : String, policyName : String) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/resume/$policyName")
      .withHeaders(httpHeaders.toList: _*)
      .post(Results.EmptyContent())
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def deletePolicy(beaconEndpoint : String, policyName : String) : Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/policy/delete/$policyName")
      .withHeaders(httpHeaders.toList: _*)
      .delete()
      .map(mapToPostActionResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}
