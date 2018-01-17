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
import com.microsoft.azure.storage.{CloudStorageAccount, StorageCredentialsSharedAccessSignature}
import com.microsoft.azure.storage.blob._
import models.CloudAccountEntities.CloudAccountWithCredentials
import models.CloudAccountEntities.Error._
import models.CloudResponseEntities.{FileListResponse, MountPointDefinition, MountPointsResponse}
import models.CloudCredentialType
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
        CloudStorageAccount.parse(s"DefaultEndpointsProtocol=${credential.protocol};" +
          s"AccountName=${accountDetails.accountName};" +
          s"AccountKey=${credential.accessKey}")
      case CloudCredentialType.WASB_SAS_TOKEN =>
        val credential = cloudAccount.accountCredentials.asInstanceOf[WASBAccountCredentialSAS]
        new CloudStorageAccount(new StorageCredentialsSharedAccessSignature(credential.token), true, null, accountDetails.accountName)
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
  override def checkUserIdentityValid(accountId: String): Future[Either[GenericError, Unit]] = {
    listContainers(accountId) map {
      case Left(err) => Left(mapError(err))
      case _ => Right(())
    }
  }
}

