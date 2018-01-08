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
import com.microsoft.azure.storage.CloudStorageAccount
import com.microsoft.azure.storage.blob._
import models.CloudAccountEntities.CloudAccountWithCredentials
import models.CloudAccountEntities.Error._
import models.WASBEntities.{BlobListResponse, MountPointsResponse, _}

import scala.collection.JavaConverters._
import scala.concurrent.{Future}
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton()
class WASBService @Inject()(val dlmKeyStore: DlmKeyStore) {

  private def mapError(err: GenericError): GenericError   = {
    GenericError(err.message)
  }

  private def getDirectoryName(path: String): String = {
    path.dropRight(1).split("/").last
  }

  private def getFileName(path: String): String = {
    path.split("/").last
  }

  private def makeConnectionString(cloudAccount: CloudAccountWithCredentials): String = {
    val credential = cloudAccount.accountCredentials.asInstanceOf[WASBAccountCredential]
    val accountDetails = cloudAccount.accountDetails.asInstanceOf[WASBAccountDetails]
    return s"DefaultEndpointsProtocol=${credential.protocol};" +
      s"AccountName=${accountDetails.accountName};" +
      s"AccountKey=${credential.accessKey}"
  }

  private def createBlobClient(accountId: String): Future[Either[GenericError, CloudBlobClient]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(cloudAccount) => {
        val connectionString: String = makeConnectionString(cloudAccount)
        try {
          Right(CloudStorageAccount.parse(connectionString).createCloudBlobClient())
        } catch {
          case e: Exception => Left(GenericError(e.getMessage()))
        }
      }
      case Left(err) => Left(GenericError(err.message))
    }
  }

  private def listContainers(accountId: String): Future[Either[GenericError, Seq[CloudBlobContainer]]] = {
    createBlobClient(accountId) map {
      case Right(client) => Right(client.listContainers().asScala.to[collection.immutable.Seq])
      case Left(err) => Left(GenericError(err.message))
    }
  }

  private def listBlobs(accountId: String, containerName: String, path: String): Future[Either[GenericError, BlobListResponse]] = {
    createBlobClient(accountId) map {
      case Right(client) => {
        val container: CloudBlobContainer = client.getContainerReference(containerName)
        if (!container.exists()) {
          Left(GenericError(message = s"Container ${containerName} is not exist"))
        } else {
          var fileList: Seq[BlobListItem] = Seq()
          for (blobItem: ListBlobItem <- container.listBlobs(path.substring(1)).asScala) {
            val file = blobItem match {
              case dir: CloudBlobDirectory => BlobListItem(
                getDirectoryName(dir.getPrefix()),
                "DIRECTORY",
                None, None)
              case blob: CloudBlob => BlobListItem(
                getFileName(blob.getName()),
                "FILE",
                Option(blob.getProperties().getLastModified().getTime()),
                Option(blob.getProperties().getLength()))
            }
            fileList = fileList :+ file
          }
          Right(BlobListResponse(fileList))
        }
      }
      case Left(err) => Left(mapError(err))
    }
  }

  def getContainers(accountId: String): Future[Either[GenericError, MountPointsResponse]] = {
    listContainers(accountId) map {
      case Right(containers) => {
        val items = containers.map { container =>
          MountPointDefinition(container.getName())
        }
        Right(MountPointsResponse(items))
      }
      case Left(err) => Left(mapError(err))
    }
  }

  def getFiles(accountId: String, containerName: String, path: String): Future[Either[GenericError, BlobListResponse]] = {
    listBlobs(accountId, containerName, path) map {
      case Right(blobs) => Right(blobs)
      case Left(err) => Left(mapError(err))
    }
  }

  // todo: need to check another way to check identity since if credential isn't valid azure-sdk
  // will throw error only after timeout
  def checkUserIdentityValid(accountId: String): Future[Either[GenericError, Unit]] = {
    listContainers(accountId) map {
      case Left(err) => Left(mapError(err))
      case _ => Right(())
    }
  }
}

