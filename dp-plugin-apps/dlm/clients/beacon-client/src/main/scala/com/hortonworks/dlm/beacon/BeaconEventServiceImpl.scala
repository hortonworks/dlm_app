package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.Exception.JsonException
import com.hortonworks.dlm.beacon.WebService.BeaconEventService
import play.api.http.Status._
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class BeaconEventServiceImpl()(implicit ws: WSClient) extends BeaconEventService {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToBeaconEventsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        (res.json \ "events").get.validate[Seq[BeaconEventResponse]] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }


  override def listEvents(beaconEndpoint : String, queryString: Map[String,String]): Future[Either[BeaconApiErrors, Seq[BeaconEventResponse]]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/events/all").withQueryString(queryString.toList: _*)
      .get.map(mapToBeaconEventsResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

}
