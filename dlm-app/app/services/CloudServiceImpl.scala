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

package services

import com.google.inject.{Inject, Singleton}
import com.hortonworks.dlm.beacon.domain.ResponseEntities.BeaconApiErrors
import factories.CloudServiceFactory
import models.CloudAccountEntities.Error.GenericError
import models.CloudAccountStatus.CloudAccountStatus
import models.CloudCredentialType
import models.CloudResponseEntities.{FileListResponse, MountPointsResponse}
import models.Entities.{CloudCredentialStatus, DlmApiErrors}
import play.api.http.Status.INTERNAL_SERVER_ERROR

import scala.concurrent.{Future, Promise}
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class CloudServiceImpl @Inject() (
  val cloudServiceFactory: CloudServiceFactory,
  val dlmKeyStore: DlmKeyStore
) extends CloudService {

  override def listMountPoints(accountId: String) : Future[Either[GenericError, MountPointsResponse]] = {
    cloudServiceFactory.build(accountId).flatMap {
      case Right(cloudService) => cloudService.listMountPoints(accountId)
      case Left(error) => Future.successful(Left(error))
    }
  }

  override def listFiles(accountId: String, mountPoint: String, path: String) : Future[Either[GenericError, FileListResponse]] = {
    cloudServiceFactory.build(accountId).flatMap {
      case Right(cloudService) => cloudService.listFiles(accountId, mountPoint, path)
      case Left(error) => Future.successful(Left(error))
    }
  }

  def checkValidityForAllCredentials: Future[Either[DlmApiErrors, Seq[CloudCredentialStatus]]] = {
    val p: Promise[Either[DlmApiErrors, Seq[CloudCredentialStatus]]] = Promise()
    dlmKeyStore.getAllCloudAccountNames.map {
      case Left(error) => p.success(Left(DlmApiErrors(List(BeaconApiErrors(INTERNAL_SERVER_ERROR, None, None, Some(error.message))))))
      case Right(cloudAccounts) =>
        val accounts = cloudAccounts.accounts
        Future.sequence(accounts.filter(x =>
          x.accountDetails.credentialType match {
            case None => false
            case Some(result) => result != CloudCredentialType.AWS_INSTANCEPROFILE
          }).map(x => checkUserIdentityValid(x.id))).map({
          cloudCredentialStatusList => {
            val allCloudCreds : Seq[CloudCredentialStatus] = cloudCredentialStatusList.filter(x => x.isRight).map(_.right.get)
            p.success(Right(allCloudCreds))
          }
        })
    }
    p.future
  }

  override def checkUserIdentityValid(accountId: String) : Future[Either[GenericError, CloudCredentialStatus]] = {
    cloudServiceFactory.build(accountId).flatMap {
      case Right(cloudService) => cloudService.checkUserIdentityValid(accountId)
      case Left(error) => Future.successful(Left(error))
    }
  }

}
