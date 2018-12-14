/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
import models.JsonFormatters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Cloud @Inject()(
  val amazonS3Service: AmazonS3Service,
  val wasbService: WASBService,
  val adlsService: ADLSService,
  val cloudServiceFactory: CloudServiceFactory,
  val cloudServiceImpl: CloudServiceImpl
) extends Controller {

  def listAllMountPoints(accountId: String) = Action.async {
    Logger.debug("Received list all bucket request")
    cloudServiceImpl.listMountPoints(accountId).map {
      case Right(mountPoints) => Ok(Json.toJson(mountPoints))
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
    }
  }

  def listFiles(accountId: String, mountPoint: String) = Action.async { request =>
    Logger.debug("Received list all objects request")
    val path: String = request.getQueryString("path").getOrElse("/")
    cloudServiceImpl.listFiles(accountId, mountPoint, path).map {
      case Right(files) => Ok(Json.toJson(files))
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
    }
  }

  def checkAllCredStatus = Action.async {
    Logger.debug("Received check for all credential status")
    cloudServiceImpl.checkValidityForAllCredentials.map {
      case Right(result) => Ok(Json.toJson(result))
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
    }
  }

  def checkUserIdentity(cloudAccountId: String) = Action.async {
    Logger.debug("Received check user identity request")
    cloudServiceImpl.checkUserIdentityValid(cloudAccountId).map {
      case Right(result) => Ok(Json.toJson(result))
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
