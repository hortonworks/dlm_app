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
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.ConfigService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

class QueryAttributes @Inject()(
                                 @Named("atlasService") val atlasService: AtlasService,
                                 @Named("configService") val configService: ConfigService
                               ) extends Controller {

  def checkAuditMockStatus = Action.async {
    configService
      .getConfig("asset.audit.mock.show").map { config => {
      config match {
        case None => Ok(Json.obj(
          "showMockVisualization" -> false
        ))
        case Some(config) => Ok(Json.obj(
          "showMockVisualization" -> config.configValue.toBoolean
        ))
      }
    }
    }
  }

  def list(clusterId: String) = AuthenticatedAction.async { req =>
    Logger.info("Received get cluster atlas attributes request")
    implicit val token = req.token
    atlasService
      .listQueryAttributes(clusterId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(attributes) => Ok(Json.toJson(attributes))
      }
  }

  def getAssetDetails(clusterId: String, atlasGuid: String) =
    AuthenticatedAction.async { req =>
      Logger.info("Received get properties for entity")
      implicit val token = req.token
      atlasService
        .getAssetDetails(clusterId, atlasGuid)
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(attributes) => Ok(Json.toJson(attributes))
        }
    }

  def getLineage(clusterId: String, atlasGuid: String) = AuthenticatedAction.async {
    request =>
      Logger.info("Received get lineage")
      implicit val token = request.token
      atlasService
        .getLineage(clusterId, atlasGuid, request.getQueryString("depth"))
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(lineage) => Ok(Json.toJson(lineage))
        }
  }

  def getTypeDefs(clusterId: String, defType: String) = AuthenticatedAction.async {
    req =>
      Logger.info(s"Received get type def for $defType")
      implicit val token = req.token
      atlasService
        .getTypeDefs(clusterId, defType)
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(typeDefs) => Ok(Json.toJson(typeDefs))
        }
  }
}
