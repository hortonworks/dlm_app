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
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.AmazonS3Entities._
import models.CloudAccountEntities._
import models.JsonFormatters._
import services.{BeaconService, DlmKeyStore}
import play.api.mvc.{Action, Controller}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CredentialStore @Inject()(
  val dlmKeyStoreService: DlmKeyStore,
  val beaconService: BeaconService
) extends Controller {

  def listAllCredentialNames = Action.async {
    Logger.info("Received list all cloud credential names request")
    dlmKeyStoreService.getAllCloudAccountNames.map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(cloudAccountNames) => Ok(Json.toJson(cloudAccountNames))
    }
  }

  // Temporarily provided for testing
  // TODO: Remove this API later for security reason
  def listAllCredentialAccounts = Action.async {
    Logger.info("Received list all cloud credential account request")
    dlmKeyStoreService.getAllCloudAccounts.map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(cloudAccounts) => Ok(Json.toJson(cloudAccounts))
    }
  }

  def addCredentialAccount = AuthenticatedAction.async (parse.json) { request =>
    Logger.info("Received add cloud credential request")
    request.body.validate[CloudAccountWithCredentials].map { credentialAccount =>
      implicit val token = request.token
      beaconService.addCloudAccount(credentialAccount).map {
        case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
        case Right(response) => Ok(JsonResponses.statusOk)
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def updateCredentialAccount = AuthenticatedAction.async (parse.json) { request =>
    Logger.info("Received update cloud credential request")
    implicit val token = request.token
    request.body.validate[CloudAccountWithCredentials].map { credentialAccount =>
      beaconService.updateDlmStoreAndCloudCreds(credentialAccount).map {
        case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
        case Right(dlmApiErrors) => Ok(Json.toJson(dlmApiErrors))
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def syncCredentialAccount(cloudAccountId: String) = AuthenticatedAction.async { request =>
    Logger.info("Received sync cloud credential request")
    implicit val token = request.token
    beaconService.syncCloudCred(cloudAccountId).map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(dlmApiErrors) => Ok(Json.toJson(dlmApiErrors))
    }
  }

  def deleteCredentialAccount(cloudAccountId: String) = AuthenticatedAction.async { request =>
    Logger.info("Received delete cloud credential request")
    implicit val token = request.token
    beaconService.deleteCloudCreds(cloudAccountId).map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(dlmApiErrors) => Ok(Json.toJson(dlmApiErrors))
    }
  }

  def deleteBeaconCredential(cloudAccountId: String) = AuthenticatedAction.async { request =>
    Logger.info("Received delete cloud credential request")
    implicit val token = request.token
    beaconService.deleteBeaconCredential(cloudAccountId).map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(dlmApiErrors) => Ok(Json.toJson(dlmApiErrors))
    }
  }
}