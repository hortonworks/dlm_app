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
import models.CloudAccountEntities._
import services.DlmKeyStore
import play.api.mvc.{Action, Controller}
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CredentialStore @Inject()(
  val dlmKeyStoreService: DlmKeyStore
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

  def addCredentialAccount = Action.async (parse.json) { request =>
    Logger.info("Received add cloud credential request")
    request.body.validate[CloudAccountWithCredentials].map { credentialAccount =>
      dlmKeyStoreService.addCloudAccount(credentialAccount).map {
        case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
        case Right(response) => Ok(JsonResponses.statusOk)
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def updateCredentialAccount = Action.async (parse.json) { request =>
    Logger.info("Received update cloud credential request")
    request.body.validate[CloudAccountWithCredentials].map { credentialAccount =>
      dlmKeyStoreService.updateCloudAccount(credentialAccount).map {
        case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
        case Right(response) => Ok(JsonResponses.statusOk)
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def deleteCredentialAccount(cloudAccountId: String) = Action.async {
    Logger.info("Received delete cloud credential request")
    dlmKeyStoreService.deleteCloudAccount(cloudAccountId).map {
      case Left(error) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(error)}"))
      case Right(response) => Ok(JsonResponses.statusOk)
    }
  }
}