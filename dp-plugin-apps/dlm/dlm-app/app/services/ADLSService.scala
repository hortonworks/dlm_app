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
import com.microsoft.azure.datalake.store.{ADLStoreClient, DirectoryEntry, DirectoryEntryType}
import com.microsoft.azure.datalake.store.oauth2.{AccessTokenProvider, ClientCredsTokenProvider}
import models.ADLSEntities.{ADLSAccountCredentials, ADLSAccountDetails, ADLSFileItem, ADLSFileListResponse}
import models.CloudAccountEntities.Error.GenericError
import models.{CloudAccountProvider, CloudAccountStatus, CloudCredentialType}
import models.CloudResponseEntities.{FileListResponse, MountPointDefinition, MountPointsResponse}
import models.Entities.CloudCredentialStatus

import scala.concurrent.Future
import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Azure Data Lake Store Client.
  * Note: There is no standard way to check user identity
  */
@Singleton()
class ADLSService @Inject()(val dlmKeyStore: DlmKeyStore) extends CloudService {
  private def getAccountFqdn(accountName: String): String = {
    s"$accountName.azuredatalakestore.net"
  }

  private def getClient(accountId: String): Future[Either[GenericError, ADLStoreClient]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(cloudAccount) => {
        CloudCredentialType.withName(cloudAccount.accountCredentials.credentialType) match {
          case CloudCredentialType.ADLS_STS => {
            val details: ADLSAccountDetails = cloudAccount.accountDetails.asInstanceOf[ADLSAccountDetails]
            val credential = cloudAccount.accountCredentials.asInstanceOf[ADLSAccountCredentials]
            val provider: AccessTokenProvider = new ClientCredsTokenProvider(credential.authTokenEndpoint, credential.clientId, credential.clientSecret)
            Right(ADLStoreClient.createClient(getAccountFqdn(details.accountName), provider))
          }
        }
      }
      case Left(err) => Left(GenericError(err.message))
    }
  }

  def listFiles(accountId: String, containerName: String, path: String): Future[Either[GenericError, FileListResponse]] = {
    getClient(accountId) map {
      case Right(client) => {
        try {
          var files: Seq[ADLSFileItem] = Seq()
          for (file: DirectoryEntry <- client.enumerateDirectory(path).asScala) {
            files = files :+ ADLSFileItem(
              file.name,
              file.lastAccessTime.getTime,
              Some(file.lastModifiedTime.getTime),
              file.blocksize,
              file.permission,
              Some(file.length),
              file.replicationFactor,
              file.user,
              file.group,
              if (file.`type` == DirectoryEntryType.FILE) "FILE" else "DIRECTORY"
            )
          }
          Right(ADLSFileListResponse(files))
        } catch {
          case e: Exception => Left(GenericError(e.getMessage))
        }
      }
      case Left(err) => Left(err)
    }
  }


  /**
    * Lists "DEFAULT" as the single mountpoint for ADLS
    * Note that ADLS does not have a native notion of Container/Bucket. This is to keep consistency with S3/WASB APIs
    * @param accountId
    * @return
    */
  override def listMountPoints(accountId: String): Future[Either[GenericError, MountPointsResponse]] = {
    Future.successful(Right(MountPointsResponse(List(MountPointDefinition(ADLSService.deafultMountPoint)))))
  }

  // todo: need to check another way to check identity since if credential isn't valid azure-sdk
  // will throw error only after timeout
  override def checkUserIdentityValid(accountId: String): Future[Either[GenericError, CloudCredentialStatus]] = {
    listFiles(accountId, ADLSService.deafultMountPoint, "/") map {
      case Left(err) =>  Left(err)
      case _ => Right(CloudCredentialStatus(accountId, CloudAccountStatus.ACTIVE))
    }
  }
}

object ADLSService {
  val deafultMountPoint = "DEFAULT"
}
