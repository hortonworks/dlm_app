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
import play.api.Logger

@Singleton
class AmbariService @Inject()(
    @Named("clusterAmbariService") ambariWebService: AmbariWebService,
    private val wSClient: WSClient,
    private val configuration: play.api.Configuration) {

  import com.hortonworks.dataplane.commons.domain.Ambari._

  private def clusterService = configuration.underlying.getString("dp.services.cluster.service.uri")

  def statusCheck(ambariEndpoint: AmbariEndpoint)(implicit hJwtToken: Option[HJwtToken]): Future[Either[Errors,AmbariCheckResponse]] = {
    ambariWebService.checkAmbariStatus(ambariEndpoint)
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
