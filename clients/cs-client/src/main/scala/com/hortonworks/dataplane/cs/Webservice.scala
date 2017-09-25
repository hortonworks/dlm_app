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

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.Ambari.{AmbariCheckResponse, AmbariCluster, AmbariDetailRequest, AmbariEndpoint, ClusterServiceWithConfigs}
import com.hortonworks.dataplane.commons.domain.Atlas.{AssetProperties, AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import play.api.libs.json.{JsObject, JsResult, JsValue, Json}
import play.api.libs.ws.{WSRequest, WSResponse}
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => ClusterData}

import scala.concurrent.Future

object Webservice {

  trait CsClientService {

    import com.hortonworks.dataplane.commons.domain.JsonFormatters._

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

  }

  trait AtlasService extends CsClientService {

    def listQueryAttributes(clusterId: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, Seq[AtlasAttribute]]]

    def searchQueryAssets(clusterId: String, filters: AtlasSearchQuery)(implicit token:Option[HJwtToken]): Future[Either[Errors, AtlasEntities]]

    def getAssetDetails(clusterId: String, atlasGuid: String)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsObject]]

    def getTypeDefs(clusterId: String, defType: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors,JsObject]]

    def getLineage(clusterId: String, atlasGuid: String, depth: Option[String])(implicit token:Option[HJwtToken]): Future[Either[Errors,JsObject]]
  }


  trait AmbariWebService extends CsClientService {

    def requestAmbariApi(clusterId: Long, ambariUrl: String, addClusterIdToResponse: Boolean = false)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]]

    def requestAmbariClusterApi(clusterId: Long, ambariUrl: String, addClusterIdToResponse: Boolean = false)(implicit token:Option[HJwtToken]): Future[Either[Errors, JsValue]]

    def syncAmbari(dpCluster: DataplaneClusterIdentifier)(implicit token:Option[HJwtToken]):Future[Boolean]

    def checkAmbariStatus(endpoint:AmbariEndpoint)(implicit token:Option[HJwtToken]):Future[Either[Errors,AmbariCheckResponse]]

    def getAmbariDetails(ambariDetailRequest: AmbariDetailRequest)(implicit token:Option[HJwtToken]):Future[Either[Errors,Seq[AmbariCluster]]]
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

  }
}
