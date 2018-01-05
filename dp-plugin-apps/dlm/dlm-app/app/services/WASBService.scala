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
import models.WASBEntities.{BlobListResponse, ClientCredentials, MountPointsResponse, _}

import scala.collection.JavaConverters._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton()
class WASBService @Inject()() {

  // TODO: this hardcode should be removed and replaced with credentials from credentials storage
  private val accessKey: String = ""
  private val accountName: String = ""
  val credentials: ClientCredentials = ClientCredentials(accountName, accessKey)

  private def mapError(err: WASBClientError): WASBClientError   = {
    WASBClientError(error = err.error)
  }

  private def getDirectoryName(path: String): String = {
    path.dropRight(1).split("/").last
  }

  private def getFileName(path: String): String = {
    path.split("/").last
  }

  private def makeConnectionString(clientCredentials: ClientCredentials): String = {
    return s"DefaultEndpointsProtocol=${clientCredentials.protocol};" +
      s"AccountName=${clientCredentials.accountName};" +
      s"AccountKey=${clientCredentials.accessKey}"
  }

  private def createBlobClient(accountName: String): Future[Either[WASBClientError, CloudBlobClient]] = {
    val connectionString: String = makeConnectionString(credentials)
    try {
      Future.successful(Right(CloudStorageAccount.parse(connectionString).createCloudBlobClient()))
    } catch {
      case e: Exception => Future.successful(Left(WASBClientError(e.getMessage())))
    }
  }

  private def listContainers(accountName: String): Future[Either[WASBClientError, Seq[CloudBlobContainer]]] = {
    createBlobClient(accountName) map {
      case Right(client) => Right(client.listContainers().asScala.to[collection.immutable.Seq])
      case Left(err) => Left(err)
    }
  }

  private def listBlobs(accountName: String, containerName: String, path: String): Future[Either[WASBClientError, BlobListResponse]] = {
    createBlobClient(accountName) map {
      case Right(client) => {
        val container: CloudBlobContainer = client.getContainerReference(containerName)
        if (!container.exists()) {
          Left(WASBClientError(error = s"Container ${containerName} is not exist"))
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
      case Left(err) => Left(err)
    }
  }

  def getContainers(accountName: String): Future[Either[WASBClientError, MountPointsResponse]] = {
    listContainers(accountName) map {
      case Right(containers) => {
        val items = containers.map { container =>
          MountPointDefinition(container.getName())
        }
        Right(MountPointsResponse(items))
      }
      case Left(err) => Left(mapError(err))
    }
  }

  def getFiles(accountName: String, containerName: String, path: String): Future[Either[WASBClientError, BlobListResponse]] = {
    listBlobs(accountName, containerName, path) map {
      case Right(blobs) => Right(blobs)
      case Left(err) => Left(mapError(err))
    }
  }
}

