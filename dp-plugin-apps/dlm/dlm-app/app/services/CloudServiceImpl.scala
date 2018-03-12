/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
