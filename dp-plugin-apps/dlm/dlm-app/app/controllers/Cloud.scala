/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company and Hortonworks, Inc. or
 * an authorized affiliate or partner thereof, any use, reproduction, modification, redistribution, sharing, lending
 * or other exploitation of all or any part of the contents of this software is strictly prohibited.
 */

package controllers

import com.google.inject.Inject
import factories.CloudServiceFactory
import models.AmazonS3Entities._
import models.CloudAccountEntities.Error._
import models.CloudResponseEntities._
import models.CloudAccountEntities.CloudAccountCredentials
import models.WASBEntities._
import models.{CloudAccountProvider, JsonResponses}
import services._
import play.api.mvc.{Action, Controller}
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Cloud @Inject()(
  val amazonS3Service: AmazonS3Service,
  val wasbService: WASBService,
  val adlsService: ADLSService,
  val cloudServiceFactory: CloudServiceFactory,
  val cloudServiceImpl: CloudServiceImpl,
  val dlmKeyStore: DlmKeyStore
) extends Controller {

  def listAllMountPoints(accountId: String) = Action.async {
    Logger.info("Received list all bucket request")
    cloudServiceImpl.listMountPoints(accountId).map {
      case Right(mountPoints) => Ok(Json.toJson(mountPoints))
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
    }
  }

  def listFiles(accountId: String, mountPoint: String) = Action.async { request =>
    Logger.info("Received list all objects request")
    val path: String = request.getQueryString("path").getOrElse("/")
    cloudServiceImpl.listFiles(accountId, mountPoint, path).map {
      case Right(files) => Ok(Json.toJson(files))
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
    }
  }

  def checkUserIdentity(cloudAccountId: String) = Action.async {
    Logger.debug("Received check user identity request")
    cloudServiceImpl.checkUserIdentityValid(cloudAccountId).map {
      case Right(files) => Ok(JsonResponses.statusOk)
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
    }
  }

  def getUserIdentity = Action.async (parse.json) { request =>
    Logger.debug("Received get user identity request")
    request.body.validate[CloudAccountCredentials].map { credential =>
      amazonS3Service.getUserIdentity(credential).map {
        case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
        case Right(cloudUserDetails) => Ok(Json.toJson(cloudUserDetails))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def getBucketPolicy(accountId: String, bucketName: String) = Action.async { request =>
    Logger.debug("Received get bucket policy request")
    amazonS3Service.getBucketPolicy(accountId, bucketName).map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(bucketPolciyText) => Ok(Json.toJson(bucketPolciyText))
    }
  }

}
