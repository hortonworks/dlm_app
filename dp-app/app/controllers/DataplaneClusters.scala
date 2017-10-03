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

package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari.AmbariEndpoint
import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneCluster, DataplaneClusterIdentifier, HJwtToken}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DpClusterService
import models.{JsonResponses, WrappedErrorsException}
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc._
import services.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService

import scala.util.Try

class DataplaneClusters @Inject()(
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    @Named("clusterAmbariService") ambariWebService: AmbariWebService,
    ambariService: AmbariService)
    extends Controller {

  def list = Action.async {
    dpClusterService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataplaneClusters) => Ok(Json.toJson(dataplaneClusters))
      }
  }

  def create = AuthenticatedAction.async(parse.json) { request =>
    implicit val token = request.token
    Logger.info("Received create data centre request")
    request.body
      .validate[DataplaneCluster]
      .map { dataplaneCluster =>
        dpClusterService
          .create(
            dataplaneCluster.copy(
              createdBy = request.user.id,
              ambariUrl = dataplaneCluster.ambariUrl.replaceFirst("/$", "")))
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(dpCluster) =>
              syncCluster(DataplaneClusterIdentifier(dpCluster.id.get))
              Ok(Json.toJson(dpCluster))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  private def syncCluster(dataplaneCluster: DataplaneClusterIdentifier)(
      implicit hJwtToken: Option[HJwtToken]): Future[Boolean] = {
    ambariService.syncCluster(dataplaneCluster).map { result =>
      Logger.info(s"Asking Cluster service to discover ${dataplaneCluster.id}")
      result
    }

  }

  def retrieve(clusterId: Long) = Action.async {
    Logger.info("Received retrieve data centre request")
    dpClusterService
      .retrieve(clusterId.toString)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataplaneCluster) => Ok(Json.toJson(dataplaneCluster))
      }
  }

  def retrieveServices(clusterId: String) = Action.async {
    Logger.info("Received retrieve data centre request")
    dpClusterService
      .retrieveServiceInfo(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(clusterServices) => Ok(Json.toJson(clusterServices))
      }
  }

  def update = Action.async(parse.json) { request =>
    Logger.info("Received update data centre request")
    request.body
      .validate[DataplaneCluster]
      .map { lake =>
        (for {
          cluster <- retrieveClusterById(lake.id.get)
          newCluster <- Future.successful(cluster.copy(
            id = lake.id,
            dcName = lake.dcName,
            description = lake.description,
            location= lake.location,
            properties = lake.properties
          ))
          updated <- updateClusterById(lake.id.get, newCluster)
        } yield {
          Ok(Json.toJson(updated))
        })
        .recover{
          case ex: WrappedErrorsException => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(ex.errors)}"))
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(clusterId: String) = Action.async {
    Logger.info("Received delete data centre request")
    dpClusterService
      .delete(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataplaneCluster) => Ok(Json.toJson(dataplaneCluster))
      }
  }

  def ambariCheck = AuthenticatedAction.async { request =>
    implicit val token = request.token
    ambariService
      .statusCheck(AmbariEndpoint(request.getQueryString("url").get))
      .flatMap {
        case Left(errors) =>
          Future.successful(InternalServerError(Json.toJson(errors)))
        case Right(checkResponse) =>{
          dpClusterService.checkExistenceByIp(checkResponse.ambariIpAddress).map{
            case Left(errors) => InternalServerError(
              JsonResponses.statusError(errors.firstMessage))
            case Right(status) =>
              if(status){
                Ok(Json.obj("alreadyExists" -> true))
              }else{
                Ok(Json.toJson(checkResponse))
              }
          }
        }
      }
  }

  private def retrieveClusterById(clusterId: Long): Future[DataplaneCluster] = {
    dpClusterService.retrieve(clusterId.toString)
        .flatMap {
          case Left(errors) => Future.failed(WrappedErrorsException(errors))
          case Right(cluster) => Future.successful(cluster)
        }
  }

  private def updateClusterById(clusterId: Long, cluster: DataplaneCluster): Future[DataplaneCluster] = {
    dpClusterService.update(cluster)
        .flatMap {
          case Left(errors) => Future.failed(WrappedErrorsException(errors))
          case Right(cluster) => Future.successful(cluster)
        }
  }

  def getAmbariServicesInfo = AuthenticatedAction.async(parse.json) { request =>
    implicit val token = request.token
    val dataplaneCluster = request.body
      .validate[DataplaneCluster]
    dataplaneCluster.map { req =>
        ambariWebService
          .getAmbariServicesInfo(req)
          .flatMap {
            case Left(errors) =>
              Future.successful(InternalServerError(Json.toJson(errors)))
            case Right(servicesInfo) => {
              val dpClusterId = Try(req.id.get).getOrElse(Future.successful(BadRequest))
              dpClusterService.retrieveServiceInfo(dpClusterId.toString)
                .map {
                  case Left(errors) =>
                    InternalServerError(Json.toJson(errors))
                  case Right(clusterServices) => {
                    val dpServices = clusterServices.map(clusterService => clusterService.servicename)
                    val availableDpServicesInfo = servicesInfo.filter(serviceInfo => dpServices.contains(serviceInfo.serviceName))
                    val sortedServicesInfo = availableDpServicesInfo.union(servicesInfo).distinct
                    Ok(Json.toJson(sortedServicesInfo))
                  }
                }
            }
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }


}
