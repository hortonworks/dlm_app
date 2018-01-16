/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import models.CloudAccountEntities.{CloudAccountCredentials, CloudAccountDetails}
import models.CloudAccountEntities.Error.GenericError
import models.CloudResponseEntities.{FileListResponse, MountPointsResponse}

import scala.concurrent.Future

trait CloudService {
  def checkUserIdentityValid(accountId: String): Future[Either[GenericError, Unit]]
  def listFiles(accountId: String, bucketName: String, path: String) : Future[Either[GenericError, FileListResponse]]
  def listMountPoints(accountId: String): Future[Either[GenericError, MountPointsResponse]]
}
