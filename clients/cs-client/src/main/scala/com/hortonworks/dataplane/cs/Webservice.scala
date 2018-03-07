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

import com.google.common.base.Strings
import com.hortonworks.dataplane.commons.domain.Ambari.{AmbariCheckResponse, AmbariCluster, AmbariDetailRequest, AmbariEndpoint, ServiceInfo}
import com.hortonworks.dataplane.commons.domain.Atlas.{AssetProperties, AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => ClusterData, _}
import com.typesafe.config.Config
import play.api.Logger
import play.api.libs.json.{JsObject, JsResult, JsSuccess, JsValue}
import play.api.libs.ws.{WSRequest, WSResponse}

import scala.concurrent.Future
import scala.util.{Success, Try}

object Webservice {

  trait CsClientService {
    val config:Config

    import com.hortonworks.dataplane.commons.domain.JsonFormatters._

    protected def url =
      Option(System.getProperty("dp.services.cluster.service.uri"))
        .getOrElse(config.getString("dp.services.cluster.service.uri"))

    protected def extractEntity[T](res: WSResponse,
                                   f: WSResponse => T): Either[Errors, T] = {
      Right(f(res))
    }

    protected def extractError(res: WSResponse,
                               f: WSResponse => JsResult[Errors]): Errors = {
      if (res.body.isEmpty)
        Errors()
      f(res).map(r => r).getOrElse(Errors())
    }

    protected def mapErrors(res: WSResponse) = {
      Left(extractError(res, r => r.json.validate[Errors]))
    }

    protected def mapResponseToError(res: WSResponse, loggerMsg: Option[String]= None) = {
      val errorsObj = Try(res.json.validate[Errors])

      errorsObj match {
        case Success(e :JsSuccess[Errors]) =>
          printLogs(res,loggerMsg)
          throw new WrappedErrorException(e.get.errors.head)
        case _ =>
          val msg = if(Strings.isNullOrEmpty(res.body)) res.statusText else  res.body
          val logMsg = loggerMsg.map { lmsg =>
            s"""$lmsg | $msg""".stripMargin
          }.getOrElse(s"In cs-client: Failed with $msg")
          printLogs(res,Option(logMsg))
          throw new WrappedErrorException(Error(res.status, msg, code = "cluster-service.generic"))
      }
    }

    private def printLogs(res: WSResponse,msg: Option[String]) ={
      val logMsg = msg.getOrElse(s"Could not get expected response status from service. Response status ${res.statusText}")
      Logger.warn(logMsg)
    }

  }

  trait AtlasService extends CsClientService {

    def listQueryAttributes(clusterId: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, Seq[AtlasAttribute]]]

    def searchQueryAssets(clusterId: String, filters: AtlasSearchQuery)(implicit token:Option[HJwtToken]): Future[Either[Errors, AtlasEntities]]

    def getAssetDetails(clusterId: String, atlasGuid: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsObject]]

    def getAssetsDetails(clusterId: String, guids: Seq[String])(implicit token:Option[HJwtToken]): Future[Either[Errors, AtlasEntities]]

    def getTypeDefs(clusterId: String, defType: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def getLineage(clusterId: String, atlasGuid: String, depth: Option[String])(implicit token:Option[HJwtToken]): Future[Either[Errors,JsObject]]
  }


  trait AmbariWebService extends CsClientService {

    def isSingleNode:Future[Boolean]

    def requestAmbariApi(clusterId: Long, ambariUrl: String, addClusterIdToResponse: Boolean = false)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]]

    def requestAmbariClusterApi(clusterId: Long, ambariUrl: String, addClusterIdToResponse: Boolean = false)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]]

    def syncAmbari(dpCluster: DataplaneClusterIdentifier)(implicit token:Option[HJwtToken]):Future[Boolean]

    def checkAmbariStatus(endpoint:AmbariEndpoint)(implicit token:Option[HJwtToken]):Future[Either[Errors,AmbariCheckResponse]]

    def getAmbariDetails(ambariDetailRequest: AmbariDetailRequest)(implicit token:Option[HJwtToken]):Future[Either[Errors,Seq[AmbariCluster]]]

    def getAmbariServicesInfo(dpcwServices: DpClusterWithDpServices)(implicit token:Option[HJwtToken]):Future[Either[Errors,Seq[ServiceInfo]]]
  }


  trait KnoxProxyService extends CsClientService {

    def getProxyUrl:String

    def execute(request:WSRequest,call: WSRequest => Future[WSResponse],fallback:Option[String])(implicit token:Option[HJwtToken]) : Future[WSResponse]

  }

  trait RangerService extends CsClientService {

    def getAuditDetails(clusterId: String, dbName: String, tableName: String, offset: String, limit: String, accessType:String, accessResult:String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsValue]]

    def getPolicyDetails(clusterId: String, dbName: String, tableName: String, offset: String, limit: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsValue]]

    def getPolicyDetailsByTagName(clusterId: Long, tags: String, offset: Long, limit: Long)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsValue]]

  }

  trait DpProfilerService extends CsClientService {

    def startProfilerJob(clusterId: String, dbName: String, tableName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def getProfilerJobStatus(clusterId: String, dbName: String, tableName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def deleteProfilerByJobName(clusterId: Long, jobName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]
    
    def startAndScheduleProfilerJob(clusterId: String, jobName: String, assets: Seq[String])(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def getScheduleInfo(clusterId: String, taskName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def getAuditResults(clusterId: String, dbName: String, tableName: String, userName: String, startDate: String, endDate: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def getAuditActions(clusterId: String, dbName: String, tableName: String, userName: String, startDate: String, endDate: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def datasetAssetMapping(clusterId: String, assetIds: Seq[String], datasetName: String)(implicit token:Option[HJwtToken]) : Future[JsObject]

  }
}
