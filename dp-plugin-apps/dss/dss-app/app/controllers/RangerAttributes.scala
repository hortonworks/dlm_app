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
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.Webservice.{AtlasService, RangerService}
import models.{ApplicationException, JsonResponses, UnsupportedInputException, WrappedErrorsException}
import models.JsonFormatters._
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import play.api.Logger
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.Controller
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class RangerAttributes @Inject()(
      @Named("atlasService")
      val atlasService: AtlasService,
      @Named("rangerService")
      val rangerService: RangerService
) extends Controller {

  def getAuditDetails(clusterId: String, dbName: String, tableName: String, offset:String, limit:String, accessType:String, accessResult:String) =
    AuthenticatedAction.async { req =>
      Logger.info("Received getAuditDetails for entity")
      implicit val token = req.token
      rangerService
        .getAuditDetails(clusterId, dbName, tableName, offset, limit, accessType, accessResult)
        .map {
          case Left(errors) => {
            errors.errors.head.status match {
              case 404 => NotFound(JsonResponses.statusError(s"${Json.toJson(errors)}"))
              case  _    => InternalServerError(Json.toJson(errors))
            }
          }
          case Right(attributes) => Ok(Json.toJson(attributes))
        }
    }

  def getPolicyDetails(clusterId: String, offset: Long, limit: Long, serviceType: String, dbName: Option[String], tableName: Option[String], guid: Option[String]) =
    AuthenticatedAction.async { req =>
      Logger.info("Received getPolicyDetails for entity")
      implicit val token = req.token

      (serviceType match {
        case "hive" => getResourceBasedPolicies(clusterId, offset, limit, dbName.getOrElse(""), tableName.getOrElse(""))
        case "tag" => getTagBasedPolicies(clusterId, offset, limit, guid.getOrElse(""))
        case _ => Future.failed(UnsupportedInputException(100, "serviceType must be 'hive' or 'tag'"))
      })
        .map { policies => Ok(Json.toJson(policies)) }
        .recover {
          case exception: WrappedErrorsException =>
            exception.errors.firstMessage match {
              case 404 => NotFound(JsonResponses.statusError(s"${Json.toJson(exception)}"))
              case _ => InternalServerError(JsonResponses.statusError(s"${Json.toJson(exception)}"))
            }
          case exception: ApplicationException =>
            new Status(exception.http) (exception.toJs)
        }
    }

  private def getResourceBasedPolicies(clusterId: String, offset: Long, limit: Long, dbName: String, tableName: String)(implicit token:Option[HJwtToken]): Future[JsValue] = {
    rangerService
      .getPolicyDetails(clusterId, dbName, tableName, offset.toString, limit.toString)
      .map {
        case Left(errors) =>  throw WrappedErrorsException(errors)
        case Right(attributes) => attributes
      }
  }

  private def getTagBasedPolicies(clusterId: String, offset: Long, limit: Long, guid: String)(implicit token:Option[HJwtToken]): Future[JsValue] = {
    for {
      tags <- getAtlasTagsByGuid(clusterId, guid)
      policies <- getPoliciesByTags(clusterId, tags, offset, limit)
    } yield policies
  }

  private def getAtlasTagsByGuid(clusterId: String, guid: String)(implicit token:Option[HJwtToken]): Future[Seq[String]] = {
    atlasService
      .getAssetDetails(clusterId, guid)
      .map {
        case Left(errors) => throw WrappedErrorsException(errors)
        case Right(asset) => (asset \ "entity" \ "classifications" \\ "typeName").map(d => d.validate[String].get)
      }
  }
  private def getPoliciesByTags(clusterId: String, tags: Seq[String], offset: Long, limit: Long)(implicit token:Option[HJwtToken]): Future[JsValue] = {
    rangerService.getPolicyDetailsByTagName(clusterId.toLong, tags.mkString(","), offset, limit)
      .map {
        case Left(errors) => throw WrappedErrorsException(errors)
        case Right(policies) => policies
      }
  }

}
