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
import factories.CloudServiceFactory
import models.CloudAccountEntities.Error.GenericError
import models.CloudResponseEntities.{FileListResponse, MountPointsResponse}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class CloudServiceImpl @Inject() (
  val cloudServiceFactory: CloudServiceFactory
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

  override def checkUserIdentityValid(accountId: String) : Future[Either[GenericError, Unit]] = {
    cloudServiceFactory.build(accountId).flatMap {
      case Right(cloudService) => cloudService.checkUserIdentityValid(accountId)
      case Left(error) => Future.successful(Left(error))
    }
  }

}
