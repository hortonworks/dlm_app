package com.hortonworks.dlm.beacon

import com.hortonworks.dlm.beacon.WebService.BeaconLogService
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.json.{JsError, JsSuccess}
import play.api.libs.ws.ahc.AhcWSResponse
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconLogServiceImpl()(implicit ws: WSClient) extends BeaconLogService {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._

  private def mapToBeaconLogsResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[BeaconLogResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  override def listLog(beaconEndpoint : String, queryString: Map[String,String]): Future[Either[BeaconApiErrors, BeaconLogResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/logs").withQueryString(queryString.toList: _*)
      .get.map(mapToBeaconLogsResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}
