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

package services

import javax.inject.{Inject, Named}

import com.google.inject.Singleton
import com.hortonworks.dataplane.commons.domain.Entities._
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.{Logger, Configuration}

@Singleton
class AmbariService @Inject()(
    @Named("clusterAmbariService") ambariWebService: AmbariWebService,
    private val wSClient: WSClient,
    private val configuration: Configuration) {

  import com.hortonworks.dataplane.commons.domain.Ambari._

  private def clusterService =
    Option(System.getProperty("dp.services.cluster.service.uri"))
      .getOrElse(
        configuration.underlying.getString("dp.services.cluster.service.uri"))

  def statusCheck(url: String, allowUntrusted: Boolean, behindGateway: Boolean)(implicit hJwtToken: Option[HJwtToken]): Future[Either[Errors,AmbariCheckResponse]] = {
    ambariWebService.checkAmbariStatus(url, allowUntrusted, behindGateway)
  }

  def getClusterServices(dpcwServices: DpClusterWithDpServices)(implicit token:Option[HJwtToken]):Future[Either[Errors,Seq[ServiceInfo]]] = {
    ambariWebService.getAmbariServicesInfo(dpcwServices)
  }
  def getClusterDetails(ambariDetailRequest: AmbariDetailRequest)(implicit hJwtToken: Option[HJwtToken]) = {
    ambariWebService.getAmbariDetails(ambariDetailRequest)
  }

  def syncCluster(dpCluster: DataplaneClusterIdentifier)(implicit hJwtToken: Option[HJwtToken]): Future[Boolean] = {
   ambariWebService.syncAmbari(dpCluster).map {
     case value@true =>
       Logger.info(s"Successfully synced datalake with ${dpCluster.id}")
       value
     case value@false =>
       Logger.error(s"Cannot sync datalake with ${dpCluster.id}")
       value
   }
  }

}
