/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Ambari.{AmbariCheckResponse, AmbariCluster, ServiceInfo}
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.{Ambari, Entities}
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService
import com.typesafe.config.Config
import play.api.libs.json._
import play.api.libs.ws.WSResponse

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AmbariWebServiceImpl(config: Config)(implicit ws: ClusterWsClient)
    extends AmbariWebService {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  import com.hortonworks.dataplane.commons.domain.Ambari.{AmbariResponseWithDpClusterId, ambariResponseWithDpClusterIdReads, ambariResponseWithDpClusterIdWrites}

  private def url = config.getString("dp.services.cluster.service.uri")

  private def mapResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[AmbariCheckResponse](
          res,
          r => (r.json \ "results" \ "data").validate[AmbariCheckResponse].get)
      case _ => mapErrors(res)
    }

  }

  override def checkAmbariStatus(endpoint: Ambari.AmbariEndpoint)(
      implicit token: Option[Entities.HJwtToken])
    : Future[Either[Errors, AmbariCheckResponse]] = {
    ws.url(s"$url/ambari/status")
      .withToken(token)
      .withHeaders("Content-Type" -> "application/json",
                   "Accept" -> "application/json")
      .post(Json.toJson(endpoint))
      .map(mapResponse)
  }

  override def getAmbariDetails(
      ambariDetailRequest: Ambari.AmbariDetailRequest)(
      implicit token: Option[Entities.HJwtToken])
    : Future[Either[Errors, Seq[Ambari.AmbariCluster]]] = {
    ws.url(s"$url/ambari/details")
      .withToken(token)
      .post(Json.toJson(ambariDetailRequest))
      .map { response =>
        if (response.status == 200) {
          val seq = response.json \ "results" \ "data"
          Right(seq.validate[Seq[AmbariCluster]].get)
        } else {
          Left(
            Errors(Seq(
              Error("500", (response.json \ "error" \ "message").as[String]))))
        }
      }
  }

  override def getAmbariServicesInfo(dpcwServices: DpClusterWithDpServices)(implicit token: Option[Entities.HJwtToken])
  : Future[Either[Errors, Seq[ServiceInfo]]] = {
    ws.url(s"$url/ambari/servicesInfo")
      .withToken(token)
      .post(Json.toJson(dpcwServices))
      .map { response =>
        if (response.status == 200) {
          val seq = response.json \ "results" \ "data"
          Right(seq.validate[Seq[ServiceInfo]].get)
        } else {
          mapErrors(response)
        }
      }
  }

  override def syncAmbari(dpCluster: Entities.DataplaneClusterIdentifier)(
      implicit token: Option[Entities.HJwtToken]): Future[Boolean] = {
    ws.url(s"$url/cluster/sync")
      .withToken(token)
      .post(Json.toJson(dpCluster))
      .map(_.status == 200)
  }

  private def insert(path: JsPath, value: JsValue) = __.json.update(path.json.put(value))

  private def mapToResults(res: WSResponse)(implicit clusterId: Option[Long])  = {
    res.status match {
      case 200 => {
        clusterId match {
          case None => Right(res.json)
          case Some(value) => {
            Right(Json.toJson(AmbariResponseWithDpClusterId(value,res.json)))
          }
        }
      }
      case _ => mapErrors(res)
    }
  }


  override def requestAmbariApi(clusterId: Long, ambariUrl: String, addClusterIdToResponse: Boolean = false)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]] = {
    implicit val _ = if (addClusterIdToResponse) Some(clusterId) else None
    ws.url(s"$url/$clusterId/ambari?request=$ambariUrl")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResults)
  }

  override def requestAmbariClusterApi(clusterId: Long, ambariUrl: String, addClusterIdToResponse: Boolean = false)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]] = {
    implicit val _ = if (addClusterIdToResponse) Some(clusterId) else None
    ws.url(s"$url/$clusterId/ambari/cluster?request=$ambariUrl")
      .withToken(token)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToResults)
  }
}
