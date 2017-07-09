package controllers

import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import models.JsonFormatters._
import services.{AmbariService, DataplaneService}
import play.api.mvc.{Action, Controller}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global

class Clusters @Inject()(
  val dataplaneService: DataplaneService,
  val ambariService: AmbariService
) extends Controller {

  /**
    * Get list of all DLM enabled clusters
    */
  def list() = Action.async {
    dataplaneService.getBeaconClusters.map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(beaconClusters) => Ok(Json.toJson(beaconClusters))
    }
  }

  def listStatus() = Action.async { req =>
    Logger.info("Received get cluster status request")
    //TODO - @DLM devs : Pull the token header out of the request and pass it into the implicit token like shown below
    // This is all that needs to be done for supporting Knox,
    // provided you use cs-client for accessing the Ambari API's and go through the proxy
    // An easier way is to wrap all of it into an action eg : dp-app/app/internal/auth/AuthAction.scala
    // or you may do this as follows, for now setting it as None
    //    implicit val token = req.headers.get("X-DP-Token-Info").map(s =>Some(HJwtToken(s))).getOrElse(None)
    implicit val token:Option[HJwtToken] = None
    ambariService.getAllClusterHealthStatus().map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }

  def retrieveStatus(clusterId: Long) = Action.async { req =>
    Logger.info("Received get cluster status request")
    //TODO - @DLM devs : Pull the token header out of the request and pass it into the implicit token like shown below
    // This is all that needs to be done for supporting Knox,
    // provided you use cs-client for accessing the Ambari API's and go through the proxy
    // An easier way is to wrap all of it into an action eg : dp-app/app/internal/auth/AuthAction.scala
    // or you may do this as follows, for now setting it as None
    //    implicit val token = req.headers.get("X-DP-Token-Info").map(s =>Some(HJwtToken(s))).getOrElse(None)
    implicit val token:Option[HJwtToken] = None
    ambariService.getClusterHealthStatus(clusterId).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(clusterStatusResponse) => Ok(Json.toJson(clusterStatusResponse))
    }
  }
}
