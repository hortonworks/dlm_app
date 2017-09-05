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
import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dataplane.cs.Webservice.DpProfilerService
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global

class DpProfilerAttributes @Inject()(
      @Named("dpProfilerService")
      val dpProfilerService: DpProfilerService,
      val authenticated: Authenticated
) extends Controller {

  def startProfilerJob(clusterId: String, dbName: String, tableName: String) = {
    authenticated.async { req =>
      Logger.info(s"Received startProfilerJob for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .startProfilerJob(clusterId, dbName, tableName)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case _ => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            }
          }
          case Right(attributes) => Accepted(Json.toJson(attributes))
        }

    }
  }

  def getProfilerJobStatus(clusterId: String, dbName: String, tableName: String) = {
    authenticated.async { req =>
      Logger.info(s"Received getProfilerJobStatus for entity $clusterId $dbName $tableName")
      implicit val token = req.token
      dpProfilerService
        .getProfilerJobStatus(clusterId, dbName, tableName)
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case _ => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }

    }
  }

  def deleteProfiler(clusterId: String, datasetId: Option[Long]) = {
    authenticated.async { req =>
      Logger.info(s"Received deleteProfiler for entity $clusterId $datasetId")
      implicit val token = req.token
      dpProfilerService
        .deleteProfilerByDatasetId(clusterId, datasetId.getOrElse(-1))
        .map {
          case Left(errors) => {
            errors.errors.head.code match {
              case "404" => NotFound(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case "405" => MethodNotAllowed(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
              case _ => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }

    }
  }

}
