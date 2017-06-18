package services

import javax.inject.{Inject, Named}

import com.google.inject.Singleton
import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneCluster, Error, Errors, HJwtToken}
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

  private def clusterService =
    Option(System.getProperty("dp.services.cluster.service.uri"))
      .getOrElse(
        configuration.underlying.getString("dp.services.cluster.service.uri"))

  def statusCheck(ambariEndpoint: AmbariEndpoint)(implicit hJwtToken: Option[HJwtToken]): Future[Either[Errors,AmbariCheckResponse]] = {
    ambariWebService.checkAmbariStatus(ambariEndpoint)
  }

  def getClusterDetails(ambariDetailRequest: AmbariDetailRequest)(implicit hJwtToken: Option[HJwtToken]) = {
    ambariWebService.getAmbariDetails(ambariDetailRequest)
  }

  def syncCluster(dpCluster: DataplaneCluster): Future[Boolean] = {
    wSClient
      .url(s"$clusterService/cluster/sync")
      .post(Json.toJson(dpCluster))
      .map { response =>
        if (response.status == 200) {
          Logger.info(s"Successfully synced datalake with ${dpCluster.id}")
          true
        } else {
          Logger.info(
            s"Sync failure datalake with id ${dpCluster.id} Details: ${response}")
          false
        }
      }
  }

  def getResourceManagerHealth(clusterId: Long) = {
    val rmHealthRequestParam = Option(
      System.getProperty("cluster.rm.health.request.param"))
      .getOrElse(
        configuration.underlying.getString("cluster.rm.health.request.param"))
    wSClient
      .url(
        s"$clusterService/$clusterId/ambari/cluster?request=$rmHealthRequestParam")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get
      .map { response =>
        if (response.status == 200) {
          Right(response.json)
        } else {
          Left(
            Errors(Seq(
              Error("500", (response.json \ "error" \ "message").as[String]))))
        }
      }
  }

}
