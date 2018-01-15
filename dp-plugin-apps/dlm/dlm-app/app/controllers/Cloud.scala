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
import models.CloudAccountEntities.Error._
import models.CloudAccountEntities.CloudAccountCredentials
import models.WASBEntities._
import services.{ADLSService, AmazonS3Service, DlmKeyStore, WASBService}
import play.api.mvc.{Action, Controller}
import models.{CloudAccountProvider, JsonResponses}
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

class Cloud @Inject()(
  val amazonS3Service: AmazonS3Service,
  val wasbService: WASBService,
  val adlsService: ADLSService,
  val dlmKeyStore: DlmKeyStore
) extends Controller {

  def listAllBuckets(cloudAccountId: String) = Action.async {
    Logger.info("Received list all bucket request")
    amazonS3Service.listAllBuckets(cloudAccountId).map {
      case Right(buckets) => Ok(Json.toJson(buckets))
      case Left(error) => {
        InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      }
    }
  }

  def listAllObjects(cloudAccountId: String, bucketName: String) = Action.async { request =>
    Logger.info("Received list all objects request")
    val path: String = request.getQueryString("path").getOrElse("/")
    amazonS3Service.listAllObjects(cloudAccountId, bucketName, path).map {
      case Right(bucketObjects) => Ok(Json.toJson(bucketObjects))
      case Left(error) => {
        InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      }
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

  def checkUserIdentity(cloudAccountId: String) = Action.async {
    Logger.debug("Received check user identity request")
    val p: Promise[Either[GenericError, Unit]] = Promise()
    dlmKeyStore.getCloudAccount(cloudAccountId) map {
      case Right(cloudAccount) => {
        val check = CloudAccountProvider.withName(cloudAccount.accountDetails.provider) match {
          case CloudAccountProvider.S3 => amazonS3Service.checkUserIdentityValid(cloudAccountId)
          case CloudAccountProvider.WASB => wasbService.checkUserIdentityValid(cloudAccountId)
          case _ => Future.successful(Left(GenericError(s"No validation for provider ${cloudAccount.accountDetails.provider}")))
        }
        check.map {
          case Left(error) => p.success(Left(error))
          case Right(res) => p.success(Right(res))
        }
      }
      case Left(error) => p.success(Left(GenericError(error.message)))
    }
    p.future.map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(result) => Ok(JsonResponses.statusOk)
    }
  }

  def listAllContainers(cloudAccountId: String) = Action.async {
    Logger.info("Received list all containers request")
    wasbService.getContainers(cloudAccountId) map {
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

  def listADLSFiles(cloudAccountId: String) = Action.async { request =>
    val path: String = request.getQueryString("path").getOrElse("/")
    adlsService.getFiles(cloudAccountId, path) map {
      case Right(files) => Ok(Json.toJson(files))
      case Left(err) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(err)}"))
    }
  }

}
