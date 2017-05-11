package controllers

import javax.inject.Inject

import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.BeaconService

import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dlm.beacon.domain.JsonFormatters._
import models.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class PolicyInstances @Inject() (val beaconService: BeaconService) extends Controller {

  /**
    * Retrieve all instances of a specific policy
    * @param clusterId   target cluster id
    * @param policyName  name of the policy
    * @return
    */
  def retrieve(clusterId: Long, policyName: String) = Action.async { request =>
    Logger.info("Received retrieve policy instance request")
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getPolicyInstances(clusterId, policyName, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))
    }
  }

  /**
    * List all instances on target cluster
    * @param clusterId  target cluster id
    * @return
    */
  def list(clusterId: Long) = Action.async { request =>
    Logger.info("Received list all jobs on target cluster request")
    val queryString : Map[String,String] = request.queryString.map { case (k,v) => k -> v.mkString }
    beaconService.getPolicyInstancesForCluster(clusterId, queryString).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(policyDetailsResponse) => Ok(Json.toJson(policyDetailsResponse))
    }
  }

  /**
    * Abort all running instances on target cluster
    * @param clusterId  target cluster id
    * @return
    */
  def abort(clusterId: Long, policyName: String) = Action.async {
    Logger.info("Received abort jobs on target cluster request")
    beaconService.abortPolicyInstancesOnCluster(clusterId, policyName).map {
      case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(response) => Ok(Json.toJson(response))
    }
  }
}
