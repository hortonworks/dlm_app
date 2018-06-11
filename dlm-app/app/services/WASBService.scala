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
import com.microsoft.azure.storage.{CloudStorageAccount, StorageCredentialsSharedAccessSignature}
import com.microsoft.azure.storage.blob._
import models.CloudAccountEntities.CloudAccountWithCredentials
import models.CloudAccountEntities.Error._
import models.CloudAccountStatus.CloudAccountStatus
import models.CloudResponseEntities.{FileListResponse, MountPointDefinition, MountPointsResponse}
import models.{CloudAccountStatus, CloudCredentialType}
import models.Entities.CloudCredentialStatus
import models.WASBEntities._

import scala.collection.JavaConverters._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton()
class WASBService @Inject()(val dlmKeyStore: DlmKeyStore) extends CloudService {

  private def mapError(err: GenericError): GenericError   = {
    GenericError(err.message)
  }

  private def getDirectoryName(path: String): String = {
    path.dropRight(1).split("/").last
  }

  private def getFileName(path: String): String = {
    path.split("/").last
  }

  private def getAccount(cloudAccount: CloudAccountWithCredentials): CloudStorageAccount = {
    val accountDetails = cloudAccount.accountDetails.asInstanceOf[WASBAccountDetails]
    CloudCredentialType.withName(cloudAccount.accountCredentials.credentialType) match {
      case CloudCredentialType.WASB_TOKEN =>
        val credential = cloudAccount.accountCredentials.asInstanceOf[WASBAccountCredential]
        CloudStorageAccount.parse(s"DefaultEndpointsProtocol=https;" +
          s"AccountName=${accountDetails.accountName};" +
          s"AccountKey=${credential.accessKey}")
      case CloudCredentialType.WASB_SAS_TOKEN =>
        val credential = cloudAccount.accountCredentials.asInstanceOf[WASBAccountCredentialSAS]
        new CloudStorageAccount(new StorageCredentialsSharedAccessSignature(credential.token), true, null, accountDetails.accountName.get)
    }
  }

  private def createBlobClient(accountId: String): Future[Either[GenericError, CloudBlobClient]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(cloudAccount) => {
        try {
          Right(getAccount(cloudAccount).createCloudBlobClient())
        } catch {
          case e: Exception => Left(GenericError(e.getMessage))
        }
      }
      case Left(err) => Left(GenericError(err.message))
    }
  }

  private def listContainers(accountId: String): Future[Either[GenericError, Seq[CloudBlobContainer]]] = {
    createBlobClient(accountId) map {
      case Right(client) => {
        try {
          Right(client.listContainers().asScala.to[collection.immutable.Seq])
        } catch {
          case e: Exception => Left(GenericError(e.getMessage))
        }
      }
      case Left(err) => Left(GenericError(err.message))
    }
  }

  private def listBlobs(accountId: String, containerName: String, path: String): Future[Either[GenericError, FileListResponse]] = {
    createBlobClient(accountId) map {
      case Right(client) => {
        try {
          val container: CloudBlobContainer = client.getContainerReference(containerName)
          if (!container.exists()) {
            Left(GenericError(message = s"Container $containerName does not exist"))
          } else {
            var fileList: Seq[BlobListItem] = Seq()
            for (blobItem: ListBlobItem <- container.listBlobs(path.substring(1)).asScala) {
              val file = blobItem match {
                case dir: CloudBlobDirectory => BlobListItem(
                  getDirectoryName(dir.getPrefix),
                  "DIRECTORY",
                  None, None)
                case blob: CloudBlob => BlobListItem(
                  getFileName(blob.getName),
                  "FILE",
                  Option(blob.getProperties.getLastModified.getTime),
                  Option(blob.getProperties.getLength))
              }
              fileList = fileList :+ file
            }
            Right(BlobListResponse(fileList))
          }
        } catch {
          case e: Exception => Left(GenericError(e.getMessage))
        }
      }
      case Left(err) => Left(mapError(err))
    }
  }

  /**
    * Lists all containers
    * @param accountId
    * @return
    */
  override def listMountPoints(accountId: String): Future[Either[GenericError, MountPointsResponse]] = {
    listContainers(accountId) map {
      case Right(containers) => {
        val items = containers.map { container =>
          MountPointDefinition(container.getName)
        }
        Right(MountPointsResponse(items))
      }
      case Left(err) => Left(mapError(err))
    }
  }

  override def listFiles(accountId: String, containerName: String, path: String): Future[Either[GenericError, FileListResponse]] = {
    listBlobs(accountId, containerName, path) map {
      case Right(blobs) => Right(blobs)
      case Left(err) => Left(mapError(err))
    }
  }

  // todo: need to check another way to check identity since if credential isn't valid azure-sdk
  // will throw error only after timeout
  override def checkUserIdentityValid(accountId: String): Future[Either[GenericError, CloudCredentialStatus]] = {
    listContainers(accountId) map {
      case Left(err) => Left(mapError(err))
      case _ => Right(CloudCredentialStatus(accountId, CloudAccountStatus.ACTIVE))
    }
  }
}

