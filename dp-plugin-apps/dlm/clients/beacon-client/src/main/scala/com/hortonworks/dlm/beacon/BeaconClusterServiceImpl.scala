/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dlm.beacon

import com.hortonworks.dataplane.commons.domain.Constants.BEACON
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.KnoxProxyWsClient
import com.hortonworks.dlm.beacon.Exception.JsonException
import play.api.libs.ws.{WSAuthScheme, WSClient, WSRequest, WSResponse}
import play.api.libs.json.{JsError, JsSuccess, Json}
import com.hortonworks.dlm.beacon.WebService.BeaconClusterService
import com.hortonworks.dlm.beacon.domain.RequestEntities._
import play.api.http.Status.{BAD_GATEWAY, SERVICE_UNAVAILABLE}
import play.api.libs.ws.ahc.AhcWSResponse

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class BeaconClusterServiceImpl()(implicit ws: KnoxProxyWsClient) extends BeaconClusterService {
  import com.hortonworks.dlm.beacon.domain.ResponseEntities._
  import com.hortonworks.dlm.beacon.domain.JsonFormatters._
  import com.hortonworks.dlm.beacon.domain.RequestEntities._

  private def mapToBeaconEntityResponse(res: WSResponse) = {
    res.status match {
      case 200 =>
        res.json.validate[BeaconEntityResponse] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
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
            val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
            Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
          }
        }
      case _ => mapErrors(res)
    }
  }

  private def mapToClusterDefinitionRequest(clusterDefinitionRequest:ClusterDefinitionRequest) : String = {
    val nnConfigs = clusterDefinitionRequest.nameNodeConfigs.foldLeft("": String) {
      (acc, next) => {
        next._2 match {
          case Some(value) => acc + s"${next._1} = $value\n"
          case None =>  acc
        }
      }
    }

    val rangerConfigs =  clusterDefinitionRequest.rangerService match {
      case None => ""
      case Some(rangerServiceDetails) => {
        "rangerEndPoint = " + rangerServiceDetails.rangerEndPoint + "\n" +
        "rangerHDFSServiceName = " +  rangerServiceDetails.rangerHDFSServiceName + "\n" +
          (rangerServiceDetails.rangerHIVEServiceName match {
            case Some(rangerHIVEServiceName) => "rangerHIVEServiceName = " + rangerHIVEServiceName + "\n"
            case None => ""
          })
      }
    }

    "beaconEndpoint = " + clusterDefinitionRequest.beaconEndpoint + "\n" +
    "description = " + clusterDefinitionRequest.description + "\n" +
    "local = " + clusterDefinitionRequest.local + "\n" +
    nnConfigs +
    (clusterDefinitionRequest.hsEndpoint match {
      case Some(hsEndpoint) => "hsEndpoint= " + hsEndpoint + "\n"
      case None => ""
    }) +
    (clusterDefinitionRequest.hsKerberosPrincipal match {
      case Some(hsKerberosPrincipal) => "hive.server2.authentication.kerberos.principal= " + hsKerberosPrincipal + "\n"
      case None => ""
    }) +
    rangerConfigs
  }

  override def listCluster(beaconEndpoint : String, clusterId: Long, clusterName: String)
                          (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, BeaconEntityResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/getEntity/$clusterName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .get.map(mapToBeaconEntityResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def listClusterStatus(beaconEndpoint : String, clusterId: Long, clusterName: String)
                                (implicit token:Option[HJwtToken]): Future[Either[BeaconApiErrors, BeaconClusterStatusResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/status/$clusterName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .get.map(mapToBeaconClusterStatusResponse).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def createClusterDefinition(beaconEndpoint : String, clusterId: Long, dataCenterClusterName : String,
                                       clusterDefinitionRequest:ClusterDefinitionRequest) (implicit token:Option[HJwtToken]):
  Future[Either[BeaconApiErrors, PostActionResponse]] = {
    val requestData:String =  mapToClusterDefinitionRequest(clusterDefinitionRequest)
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/submit/$dataCenterClusterName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .post(requestData)
      .map(res => {
      val url = Some(res.asInstanceOf[AhcWSResponse].ahcResponse.getUri.toUrl)
      res.status match {
        case 200 =>
          res.json.validate[PostActionResponse] match {
            case JsSuccess(result, _) => Right(result)
            case JsError(error) => {
              Left(BeaconApiErrors(BAD_GATEWAY, url, Some(BeaconApiError(error.toString()))))
            }
          }
        case _ => {
          if (res.body.isEmpty)
            Left(BeaconApiErrors(res.status, url))
          val errMessage = s"Submitting cluster definition for ${clusterDefinitionRequest.name} (${clusterDefinitionRequest.dataCenter}) " +
            s"to endpoint $beaconEndpoint failed:"
          res.json.validate[BeaconApiError].map(r => {
            Left(BeaconApiErrors(res.status,url,Some(BeaconApiError(s"$errMessage ${r.message}", r.status, r.requestId))))
          }).getOrElse(Left(BeaconApiErrors(res.status, url)))
        }
      }
    }).recoverWith {
        case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }

  override def deleteClusterDefinition(beaconEndpoint : String, clusterId: Long, dataCenterClusterName : String) (implicit token:Option[HJwtToken]):
  Future[Either[BeaconApiErrors, PostActionResponse]] = {
    ws.url(s"${urlPrefix(beaconEndpoint)}/cluster/delete/$dataCenterClusterName", clusterId, BEACON).withHeaders(token)
      .withAuth(user, password, WSAuthScheme.BASIC)
      .withHeaders(httpHeaders.toList: _*)
      .delete().map(mapToPostActionResponse).recoverWith {
      case e: Exception => Future.successful(Left(BeaconApiErrors(SERVICE_UNAVAILABLE, Some(beaconEndpoint), Some(BeaconApiError(e.getMessage)))))
    }
  }
}