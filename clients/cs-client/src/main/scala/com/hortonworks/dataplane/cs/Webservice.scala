package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.Ambari.ClusterServiceWithConfigs
import com.hortonworks.dataplane.commons.domain.Atlas.{AssetProperties, AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import play.api.libs.json.{JsObject, JsResult, Json, JsValue}
import play.api.libs.ws.WSResponse
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => ClusterData}

import scala.concurrent.Future

object Webservice {

  trait CSClientService {

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

  trait AtlasService extends CSClientService {

    def listQueryAttributes(clusterId: String): Future[Either[Errors, Seq[AtlasAttribute]]]

    def searchQueryAssets(clusterId: String, filters: AtlasSearchQuery): Future[Either[Errors, AtlasEntities]]

    def getAssetDetails(clusterId: String, atlasGuid: String): Future[Either[Errors, JsObject]]

    def getTypeDefs(clusterId: String, defType: String) : Future[Either[Errors,JsObject]]

    def getLineage(clusterId: String, atlasGuid: String, depth: Option[String]): Future[Either[Errors,JsObject]]
  }

  trait AmbariService extends CSClientService {

    def getAmbariResponse(clusterId: Long, ambariUrl: String): Future[Either[Errors, JsValue]]
  }

}
