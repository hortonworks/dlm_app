/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company and Hortonworks, Inc. or
 * an authorized affiliate or partner thereof, any use, reproduction, modification, redistribution, sharing, lending
 * or other exploitation of all or any part of the contents of this software is strictly prohibited.
 */

package controllers

import com.google.inject.Inject
import models.AmazonS3Entities._
import models.WASBEntities._
import services.{AmazonS3Service, WASBService}
import play.api.mvc.{Action, Controller}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Cloud @Inject()(
  val amazonS3Service: AmazonS3Service,
  val wasbService: WASBService
) extends Controller {

  def listAllBuckets(accountId: Long, userName: String) = Action.async {
    Logger.info("Received list all bucket request")
    amazonS3Service.listAllBuckets(accountId, userName).map {
      case Right(buckets) => Ok(Json.toJson(buckets))
      case Left(error) => {
        InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      }
    }
  }

  def listAllObjects(accountId: Long, userName: String, bucketName: String) = Action.async { request =>
    Logger.info("Received list all objects request")
    val path: String = request.getQueryString("path").getOrElse("/")
    amazonS3Service.listAllObjects(accountId, userName, bucketName, path).map {
      case Right(bucketObjects) => Ok(Json.toJson(bucketObjects))
      case Left(error) => {
        InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      }
    }
  }

  def getUserIdentity = Action.async (parse.json) { request =>
    Logger.debug("Received get user identity request")
    request.body.validate[Credential].map { credential =>
      amazonS3Service.getUserIdentity(credential).map {
        case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
        case Right(cloudUserDetails) => Ok(Json.toJson(cloudUserDetails))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def checkUserIdentity(accountId: Long, userName: String) = Action.async { request =>
    Logger.debug("Received check user identity request")
    amazonS3Service.checkUserIdentityValid(accountId, userName).map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(result) => Ok(JsonResponses.statusOk)
    }
  }

  def listAllContainers(accountName: String) = Action.async {
    Logger.info("Received list all containers request")
    wasbService.getContainers(accountName) map {
      case Right(containers) => Ok(Json.toJson(containers))
      case Left(err) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(err)}"))
    }
  }

  def listAllBlobs(accountName: String, containerName: String) = Action.async { request =>
    Logger.info("Received list all blobs request")
    val path: String = request.getQueryString("path").getOrElse("/")
    wasbService.getFiles(accountName, containerName, path) map {
      case Right(filesResponse) => Ok(Json.toJson(filesResponse))
      case Left(err) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(err)}"))
    }
  }

}
