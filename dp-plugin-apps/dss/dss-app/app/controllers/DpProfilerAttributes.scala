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

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.auth.{AuthenticatedAction}
import com.hortonworks.dataplane.cs.Webservice.DpProfilerService
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DataSetService
import services.UtilityService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DpProfilerAttributes @Inject()(
      @Named("dpProfilerService") val dpProfilerService: DpProfilerService,
      @Named("dataSetService") val dataSetService: DataSetService,
      val utilityService: UtilityService
) extends Controller {

  def startProfilerJob(clusterId: String, dbName: String, tableName: String) = {
    AuthenticatedAction.async { req =>
      Logger.info(s"Received startProfilerJob for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .startProfilerJob(clusterId, dbName, tableName)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case _ => InternalServerError(Json.toJson(errors))
            }
          }
          case Right(attributes) => Accepted(Json.toJson(attributes))
        }

    }
  }

  def getProfilerJobStatus(clusterId: String, dbName: String, tableName: String) = {
    AuthenticatedAction.async { req =>
      Logger.info(s"Received getProfilerJobStatus for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .getProfilerJobStatus(clusterId, dbName, tableName)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case _ => InternalServerError(Json.toJson(errors))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }

    }
  }

  def getScheduleStatus(clusterId: String, dataSetId: String) = {
    AuthenticatedAction.async { req =>
      Logger.info(s"Received getScheduleStatus for entity $clusterId $dataSetId")
      implicit val token = req.token
      dataSetService.retrieve(dataSetId).flatMap{
        case Left(errors) => Future.successful(InternalServerError(Json.toJson(errors)))
        case Right(datasetAndCategories) => {
          val dataset = datasetAndCategories.dataset
          for {
            jobName <- utilityService.doGenerateJobName(dataset.id.get, dataset.name)
            feu <- dpProfilerService.getScheduleInfo(clusterId, jobName)
          } yield {
            feu match {
              case Left(errors) => {
                errors.errors.head.code match {
                  case "404" => NotFound(JsonResponses.statusError(s"${Json.toJson(errors)}"))
                  case "405" => MethodNotAllowed(JsonResponses.statusError(s"${Json.toJson(errors)}"))
                  case _ => InternalServerError(Json.toJson(errors))
                }
              }
              case Right(attributes) => Ok(Json.toJson(attributes))
            }
          }
        }
      }
    }
  }

  def getAuditResults(clusterId: String, dbName: String, tableName: String, startDate: String, endDate: String, userName: String) = {
    AuthenticatedAction.async { req =>
      Logger.info(s"Received getAuditActions for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .getAuditResults(clusterId, dbName, tableName, userName, startDate, endDate)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case "503" => ServiceUnavailable(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case _ => InternalServerError(Json.toJson(errors))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }

    }
  }


  def getAuditActions(clusterId: String, dbName: String, tableName: String, startDate: String, endDate: String, userName: String) = {
    AuthenticatedAction.async { req =>
      Logger.info(s"Received getAuditActions for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .getAuditActions(clusterId, dbName, tableName, userName, startDate, endDate)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case "503" => ServiceUnavailable(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case _ => InternalServerError(Json.toJson(errors))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }

    }
  }


}
